import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createCheckoutSession = async (req, res) => {
  try {
    let { cart_items } = req.body

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res
        .status(400)
        .json({ error: 'Cart items are required and must be a non-empty array' })
    }

    const line_items = cart_items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/сheckout`,
    })

    res.json({
      id: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
