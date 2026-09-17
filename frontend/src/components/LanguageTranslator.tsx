'use client'

import { useEffect, useRef } from 'react'
import { useLanguageStore } from '@/store/languageStore'
import { DICTIONARY, LanguageCode } from '@/i18n/translations'

// Global memory maps to preserve original English content across infinite language switches
const originalTextMap = new WeakMap<Node, string>()
const originalPlaceholderMap = new WeakMap<HTMLElement, string>()
const originalTitleMap = new WeakMap<HTMLElement, string>()
const originalAriaMap = new WeakMap<HTMLElement, string>()

export default function LanguageTranslator() {
  const { currentLanguage } = useLanguageStore()
  const isTranslatingRef = useRef(false)

  // 1. Google Translate Cookie & Automation
  useEffect(() => {
    if (typeof window === 'undefined') return

    const langCode = currentLanguage.toLowerCase()
    
    // Set Google Translate cookie
    const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`
    document.cookie = `googtrans=${cookieVal}; path=/;`

    // Update document HTML lang attribute and text direction (RTL for Arabic)
    document.documentElement.lang = langCode
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'

    // Inject Google Translate script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.head.appendChild(script)

      // Define init function
      ;(window as any).googleTranslateElementInit = () => {
        try {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,de,es,fr,ja,zh-CN,hi,ru,ar',
              autoDisplay: false,
              layout: (window as any).google.translate.TranslateElement.InlineLayout?.SIMPLE
            },
            'google_translate_element'
          )
        } catch (e) {
          // ignore
        }
      }
    }

    // Trigger Google Translate change if widget select exists
    try {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
      if (select) {
        select.value = langCode === 'zh' ? 'zh-CN' : langCode
        select.dispatchEvent(new Event('change'))
      }
    } catch (e) {}
  }, [currentLanguage])

  // 2. High-Speed Direct DOM Translation Engine
  useEffect(() => {
    if (typeof window === 'undefined' || !document.body) return

    const dict = DICTIONARY[currentLanguage] || {}
    const isEnglish = currentLanguage === 'en'

    // Sort dictionary keys longest-first to prevent partial collisions
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length)

    function translateString(text: string): string {
      if (!text || text.trim().length === 0) return text
      if (isEnglish) return text

      const trimmed = text.trim()
      // Protect pure numbers, counts, and stats from accidental translation replacement
      if (/^[\d\s,.\/+%()\-:]+$/.test(trimmed)) return text

      // Exact match check
      if (dict[trimmed]) {
        return text.replace(trimmed, dict[trimmed])
      }

      // Partial phrase replacement
      let replaced = text
      for (const key of sortedKeys) {
        if (key && replaced.includes(key)) {
          replaced = replaced.split(key).join(dict[key])
        }
      }
      return replaced
    }

    function processNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const currentVal = node.nodeValue || ''
        if (!currentVal.trim()) return

        // Skip non-translatable parent elements
        const parent = node.parentElement
        if (parent) {
          const tagName = parent.tagName.toLowerCase()
          if (['script', 'style', 'noscript', 'code', 'pre'].includes(tagName)) return
          if (parent.classList.contains('notranslate')) return
        }

        // Store original text on first encounter
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal)
        }

        const originalText = originalTextMap.get(node) || currentVal

        if (isEnglish) {
          if (node.nodeValue !== originalText) {
            node.nodeValue = originalText
          }
        } else {
          const translated = translateString(originalText)
          if (node.nodeValue !== translated) {
            node.nodeValue = translated
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toLowerCase()
        if (['script', 'style', 'noscript', 'code', 'pre'].includes(tagName)) return

        // Translate Placeholder
        if (el.hasAttribute('placeholder')) {
          const currentPh = el.getAttribute('placeholder') || ''
          if (!originalPlaceholderMap.has(el)) {
            originalPlaceholderMap.set(el, currentPh)
          }
          const origPh = originalPlaceholderMap.get(el) || currentPh
          el.setAttribute('placeholder', isEnglish ? origPh : translateString(origPh))
        }

        // Translate Title Attribute
        if (el.hasAttribute('title')) {
          const currentTitle = el.getAttribute('title') || ''
          if (!originalTitleMap.has(el)) {
            originalTitleMap.set(el, currentTitle)
          }
          const origTitle = originalTitleMap.get(el) || currentTitle
          el.setAttribute('title', isEnglish ? origTitle : translateString(origTitle))
        }

        // Translate Aria-Label
        if (el.hasAttribute('aria-label')) {
          const currentAria = el.getAttribute('aria-label') || ''
          if (!originalAriaMap.has(el)) {
            originalAriaMap.set(el, currentAria)
          }
          const origAria = originalAriaMap.get(el) || currentAria
          el.setAttribute('aria-label', isEnglish ? origAria : translateString(origAria))
        }

        // Recursively translate children
        el.childNodes.forEach(processNode)
      }
    }

    // Execute full DOM sweep
    isTranslatingRef.current = true
    processNode(document.body)
    isTranslatingRef.current = false

    // Dynamic MutationObserver for AJAX data, Modals, Feed updates
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return
      isTranslatingRef.current = true

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(processNode)
        } else if (mutation.type === 'characterData') {
          processNode(mutation.target)
        }
      })

      isTranslatingRef.current = false
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    // Additional pass after 300ms for delayed components
    const timer = setTimeout(() => {
      isTranslatingRef.current = true
      processNode(document.body)
      isTranslatingRef.current = false
    }, 300)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [currentLanguage])

  return (
    <div id="google_translate_element" className="hidden" aria-hidden="true" style={{ display: 'none' }} />
  )
}
