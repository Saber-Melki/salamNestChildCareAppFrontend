// src/services/api-client.ts
import Cookies from "js-cookie"

class ApiClient {
  private baseURL: string = "http://localhost:8080"

  isAuthenticated(): boolean {
    return Boolean(Cookies.get("accessToken"))
  }

  // ... (autres méthodes)

  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      throw new Error("Invalid credentials")
    }
    // Si le backend définit le cookie HttpOnly, cette partie est juste pour la "réussite" de la connexion.
    // Les cookies sont gérés automatiquement par le navigateur.
    return response.json()
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Pas besoin de passer le token manuellement si c'est un cookie
        // 'Authorization': `Bearer ${Cookies.get('accessToken')}` // Seulement si vous gérez le token manuellement
      },
      credentials: "include", // Important pour envoyer les cookies
    })
    if (!response.ok) {
      // Gérer la déconnexion si 401 ou 403
      if (response.status === 401 || response.status === 403) {
        this.logout() // Déclencher la déconnexion via le client API
      }
      throw new Error(`API error: ${response.statusText}`)
    }
    return response.json() as Promise<T>
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    if (!response.ok) {
      console.error("Failed to log out on server.")
    }
    Cookies.remove("accessToken") // Supprimer le cookie côté client si non HttpOnly
  }
}

export const apiClient = new ApiClient()