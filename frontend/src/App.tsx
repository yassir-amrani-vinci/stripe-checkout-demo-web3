import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242'

export default function App() {
  const [message, setMessage] = useState('')
  const page = window.location.pathname

  if (page === '/success') {
    return <SuccessPage />
  }

  if (page === '/cancel') {
    return <SimplePage title="Paiement annulé" text="Aucun paiement n’a été effectué." />
  }

  async function payer() {
    setMessage('Redirection vers Stripe…')

    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.')
    }
  }

  return (
    <main>
      <img className="costume" src="/costume-rouge.jpeg" alt="Homme portant un costume rouge" />
      <h1>C’est le diable ou quoi ?</h1>
      <p className="price">Costume rouge — 49,99 €</p>
      <p>Un produit fictif pour tester Stripe Checkout sans paiement réel.</p>
      <button onClick={payer}>Payer en mode test</button>
      {message && <p className="message">{message}</p>}
    </main>
  )
}

function SuccessPage() {
  const [status, setStatus] = useState('Vérification du paiement auprès de Stripe…')

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')

    if (!sessionId) {
      setStatus('Impossible de vérifier le paiement : session_id manquant.')
      return
    }

    fetch(`${API_URL}/api/session/${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        return data
      })
      .then((data) => {
        setStatus(`Paiement confirmé par Stripe : ${data.payment_status}`)
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : 'Vérification impossible.')
      })
  }, [])

  return <SimplePage title="Paiement réussi !" text={status} />
}

function SimplePage({ title, text }: { title: string; text: string }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>{text}</p>
      <a href="/">Retour à la boutique</a>
    </main>
  )
}
