import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const aiService = {
  async generateResponse(prompt: string, context: string = '') {
    const response = await axios.post(`${API_URL}/api/ai/generate`, {
      prompt,
      context,
    })
    return response.data
  }
}
