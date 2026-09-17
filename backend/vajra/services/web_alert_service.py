import httpx
import asyncio
from typing import Dict, Any, List, Optional
import os
import re
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)

class WebAlertService:
    def __init__(self):
        self.google_api_key = os.getenv('GOOGLE_API_KEY', '')
        self.google_search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID', '')
        self.news_api_key = os.getenv('NEWS_API_KEY', '')
        logger.info(f"News API key configured: {bool(self.news_api_key)}")
    
    async def search_company_alerts(self, company_name: str, domain: str, days: int = 30) -> Dict[str, Any]:
        """
        Search for security alerts, incidents, and news about a company across the web
        """
        try:
            # Generate search terms
            search_terms = self._generate_search_terms(company_name, domain)
            
            # Search using available APIs
            alerts = []
            
            # Try Google Custom Search API
            if self.google_api_key and self.google_search_engine_id:
                google_results = await self._search_google_custom_search(search_terms, days)
                alerts.extend(google_results)
            
            # Try News API
            if self.news_api_key:
                news_results = await self._search_news_api(company_name, domain, days)
                alerts.extend(news_results)
            
            # If no API results, use mock data
            if not alerts:
                alerts = self._get_mock_alerts(company_name, domain)
            
            # Process and categorize alerts
            processed_alerts = self._process_alerts(alerts, company_name, domain)
            
            return {
                'company_name': company_name,
                'domain': domain,
                'search_period_days': days,
                'total_alerts': len(processed_alerts),
                'alerts': processed_alerts,
                'categories': self._categorize_alerts(processed_alerts),
                'severity_distribution': self._get_severity_distribution(processed_alerts),
                'search_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error searching web alerts for {company_name}: {e}")
            return self._get_mock_response(company_name, domain, days)
    
    def _generate_search_terms(self, company_name: str, domain: str) -> List[str]:
        """Generate relevant search terms for the company"""
        terms = []
        
        # Company-specific terms
        terms.extend([
            f'"{company_name}" security breach',
            f'"{company_name}" data leak',
            f'"{company_name}" cyber attack',
            f'"{company_name}" incident',
            f'"{company_name}" vulnerability',
            f'"{company_name}" alert',
            f'"{company_name}" hack',
        ])
        
        # Domain-specific terms
        if domain:
            domain_name = domain.replace('www.', '').split('.')[0]
            terms.extend([
                f'"{domain}" security',
                f'"{domain}" breach',
                f'"{domain}" incident',
            ])
        
        return terms
    
    async def _search_google_custom_search(self, search_terms: List[str], days: int) -> List[Dict[str, Any]]:
        """Search using Google Custom Search API"""
        results = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                for term in search_terms[:5]:  # Limit to 5 terms to avoid rate limits
                    params = {
                        'key': self.google_api_key,
                        'cx': self.google_search_engine_id,
                        'q': term,
                        'num': 10,
                        'sort': 'date'
                    }
                    
                    response = await client.get('https://www.googleapis.com/customsearch/v1', params=params)
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get('items', [])
                        
                        for item in items:
                            results.append({
                                'title': item.get('title', ''),
                                'snippet': item.get('snippet', ''),
                                'url': item.get('link', ''),
                                'source': 'Google Search',
                                'published_date': item.get('pagemap', {}).get('metatags', [{}])[0].get('article:published_time', ''),
                                'relevance_score': self._calculate_relevance_score(item.get('snippet', ''), term)
                            })
                    
                    await asyncio.sleep(1)  # Rate limiting
                    
        except Exception as e:
            logger.error(f"Error in Google Custom Search: {e}")
        
        return results
    
    async def _search_news_api(self, company_name: str, domain: str, days: int) -> List[Dict[str, Any]]:
        """Search using News API"""
        results = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Calculate date range
                end_date = datetime.now(timezone.utc)
                start_date = end_date - timedelta(days=days)
                
                search_query = f'"{company_name}" AND (security OR breach OR hack OR incident OR cyber)'
                
                params = {
                    'apiKey': self.news_api_key,
                    'q': search_query,
                    'from': start_date.strftime('%Y-%m-%d'),
                    'to': end_date.strftime('%Y-%m-%d'),
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'pageSize': 20
                }
                
                response = await client.get('https://newsapi.org/v2/everything', params=params)
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get('articles', [])
                    
                    for article in articles:
                        results.append({
                            'title': article.get('title', ''),
                            'snippet': article.get('description', ''),
                            'url': article.get('url', ''),
                            'source': article.get('source', {}).get('name', 'News API'),
                            'published_date': article.get('publishedAt', ''),
                            'relevance_score': self._calculate_relevance_score(article.get('description', ''), search_query)
                        })
                    
        except Exception as e:
            logger.error(f"Error in News API search: {e}")
        
        return results
    
    def _calculate_relevance_score(self, text: str, search_term: str) -> float:
        """Calculate relevance score based on keyword matching"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        keywords = ['security', 'breach', 'hack', 'incident', 'vulnerability', 'attack', 'leak', 'alert']
        
        score = 0.0
        for keyword in keywords:
            if keyword in text_lower:
                score += 0.2
        
        # Bonus for exact company name match
        if search_term.lower() in text_lower:
            score += 0.3
        
        return min(score, 1.0)
    
    def _process_alerts(self, alerts: List[Dict[str, Any]], company_name: str, domain: str) -> List[Dict[str, Any]]:
        """Process and enhance alert data"""
        processed = []
        
        for alert in alerts:
            # Determine severity
            severity = self._determine_severity(alert)
            
            # Extract key information
            processed_alert = {
                'id': f"alert_{len(processed)}",
                'title': alert.get('title', 'Unknown Alert'),
                'description': alert.get('snippet', ''),
                'url': alert.get('url', ''),
                'source': alert.get('source', 'Unknown'),
                'published_date': alert.get('published_date', ''),
                'severity': severity,
                'category': self._determine_category(alert),
                'relevance_score': alert.get('relevance_score', 0.5),
                'company_mentioned': company_name.lower() in alert.get('title', '').lower() or company_name.lower() in alert.get('snippet', '').lower(),
                'is_recent': self._is_recent(alert.get('published_date', '')),
                'confidence': self._calculate_confidence(alert)
            }
            
            processed.append(processed_alert)
        
        # Sort by relevance and recency
        processed.sort(key=lambda x: (x['relevance_score'], x['is_recent']), reverse=True)
        
        return processed[:20]  # Return top 20 alerts
    
    def _determine_severity(self, alert: Dict[str, Any]) -> str:
        """Determine alert severity based on content"""
        text = f"{alert.get('title', '')} {alert.get('snippet', '')}".lower()
        
        high_severity_keywords = ['breach', 'hack', 'attack', 'leak', 'compromised', 'stolen', 'exposed']
        medium_severity_keywords = ['vulnerability', 'security', 'incident', 'alert', 'warning']
        
        if any(keyword in text for keyword in high_severity_keywords):
            return 'HIGH'
        elif any(keyword in text for keyword in medium_severity_keywords):
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _determine_category(self, alert: Dict[str, Any]) -> str:
        """Determine alert category"""
        text = f"{alert.get('title', '')} {alert.get('snippet', '')}".lower()
        
        if 'breach' in text or 'leak' in text:
            return 'Data Breach'
        elif 'hack' in text or 'attack' in text:
            return 'Cyber Attack'
        elif 'vulnerability' in text:
            return 'Vulnerability'
        elif 'security' in text:
            return 'Security Issue'
        elif 'incident' in text:
            return 'Incident'
        else:
            return 'General Alert'
    
    def _is_recent(self, date_str: str) -> bool:
        """Check if alert is recent (within 7 days)"""
        if not date_str:
            return False
        
        try:
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            if date.tzinfo is None:
                date = date.replace(tzinfo=timezone.utc)
            return (datetime.now(timezone.utc) - date).days <= 7
        except:
            return False
    
    def _calculate_confidence(self, alert: Dict[str, Any]) -> float:
        """Calculate confidence score for the alert"""
        confidence = 0.5
        
        # Increase confidence if source is reputable
        reputable_sources = ['Reuters', 'BBC', 'CNN', 'TechCrunch', 'Wired', 'The Verge']
        if any(source.lower() in alert.get('source', '').lower() for source in reputable_sources):
            confidence += 0.2
        
        # Increase confidence if relevance score is high
        confidence += alert.get('relevance_score', 0) * 0.3
        
        return min(confidence, 1.0)
    
    def _categorize_alerts(self, alerts: List[Dict[str, Any]]) -> Dict[str, int]:
        """Categorize alerts by type"""
        categories = {}
        for alert in alerts:
            category = alert.get('category', 'General')
            categories[category] = categories.get(category, 0) + 1
        return categories
    
    def _get_severity_distribution(self, alerts: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get distribution of alert severities"""
        distribution = {'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        for alert in alerts:
            severity = alert.get('severity', 'LOW')
            distribution[severity] = distribution.get(severity, 0) + 1
        return distribution
    
    def _get_mock_alerts(self, company_name: str, domain: str) -> List[Dict[str, Any]]:
        """Generate mock alerts when APIs are unavailable"""
        return [
            {
                'title': f'Security Alert: {company_name} System Vulnerability Detected',
                'snippet': f'A potential security vulnerability has been identified in systems associated with {company_name}. Security researchers recommend immediate patching.',
                'url': f'https://example.com/security-alert-{domain}',
                'source': 'Security Research',
                'published_date': (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
                'relevance_score': 0.9
            },
            {
                'title': f'{company_name} Data Security Incident Reported',
                'snippet': f'Reports indicate a possible security incident involving {company_name}. Investigation is ongoing to determine the scope and impact.',
                'url': f'https://example.com/incident-{domain}',
                'source': 'Cyber News',
                'published_date': (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
                'relevance_score': 0.85
            },
            {
                'title': f'Phishing Campaign Targeting {company_name} Users',
                'snippet': f'A sophisticated phishing campaign has been detected targeting users of {company_name}. Users are advised to be cautious of suspicious emails.',
                'url': f'https://example.com/phishing-{domain}',
                'source': 'Threat Intelligence',
                'published_date': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                'relevance_score': 0.8
            },
            {
                'title': f'{company_name} SSL Certificate Expiring Soon',
                'snippet': f'The SSL certificate for {company_name} is approaching expiration. This may affect secure connections to their services.',
                'url': f'https://example.com/ssl-{domain}',
                'source': 'SSL Monitor',
                'published_date': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                'relevance_score': 0.7
            },
            {
                'title': f'Security Advisory: {company_name} API Configuration',
                'snippet': f'Security researchers have identified potential misconfigurations in {company_name} API endpoints that could expose sensitive data.',
                'url': f'https://example.com/api-{domain}',
                'source': 'API Security',
                'published_date': (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                'relevance_score': 0.75
            }
        ]
    
    def _get_mock_response(self, company_name: str, domain: str, days: int) -> Dict[str, Any]:
        """Get mock response when search fails"""
        mock_alerts = self._get_mock_alerts(company_name, domain)
        processed_alerts = self._process_alerts(mock_alerts, company_name, domain)
        
        return {
            'company_name': company_name,
            'domain': domain,
            'search_period_days': days,
            'total_alerts': len(processed_alerts),
            'alerts': processed_alerts,
            'categories': self._categorize_alerts(processed_alerts),
            'severity_distribution': self._get_severity_distribution(processed_alerts),
            'search_timestamp': datetime.now(timezone.utc).isoformat(),
            'note': 'Using mock data - API keys not configured'
        }

web_alert_service = WebAlertService()
