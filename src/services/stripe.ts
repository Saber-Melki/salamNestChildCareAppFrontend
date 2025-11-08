// src/services/stripe.ts
import { loadStripe, type Stripe } from '@stripe/stripe-js';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

let stripePromise: Promise<Stripe | null> | null = null;

export async function getStripe(): Promise<Stripe> {
  if (!stripePromise) {
    if (!STRIPE_PK) {
      console.warn('VITE_STRIPE_PUBLISHABLE_KEY is missing in your env');
    }
    stripePromise = loadStripe(STRIPE_PK);
  }
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');
  return stripe; // non-null
}
