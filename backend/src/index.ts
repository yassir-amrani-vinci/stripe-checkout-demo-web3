import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import Stripe from 'stripe'
import { PRODUCT } from './product.js'

const app = express()
const port = Number(process.env.PORT) || 4242
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', mode: 'test' })
})

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    return null
  }

  return new Stripe(secretKey)
}

app.post('/api/create-checkout-session', async (_request, response) => {
  const stripe = getStripe()

  if (!stripe) {
    response.status(503).json({
      error: 'Configurez une clé Stripe de test (sk_test_…) dans backend/.env.',
    })
    return
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRODUCT.currency,
            unit_amount: PRODUCT.unitAmount,
            product_data: {
              name: PRODUCT.name,
              description: PRODUCT.description,
            },
          },
        },
      ],
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
    })

    if (!session.url) throw new Error('Stripe n’a pas retourné d’URL Checkout.')
    response.json({ url: session.url })
  } catch (error) {
    console.error('Erreur Stripe :', error)
    response.status(500).json({ error: 'La session de paiement n’a pas pu être créée.' })
  }
})

app.get('/api/session/:id', async (request, response) => {
  const stripe = getStripe()

  if (!stripe) {
    response.status(503).json({
      error: 'Configurez une clé Stripe de test (sk_test_…) dans backend/.env.',
    })
    return
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(request.params.id)
    response.json({ payment_status: session.payment_status })
  } catch (error) {
    console.error('Erreur de vérification Stripe :', error)
    response.status(404).json({ error: 'Session Stripe introuvable.' })
  }
})

app.listen(port, () => {
  console.log(`Backend prêt sur http://localhost:${port}`)
})
