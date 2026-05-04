'use client'

import { useEffect } from 'react'

export default function TawkChat() {
  useEffect(() => {
    const s1 = document.createElement('script')
    s1.async = true
    s1.src = 'https://embed.tawk.to/69f837dfd878671c31424b45/1jnopkgmg'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    document.body.appendChild(s1)
  }, [])

  return null
}
