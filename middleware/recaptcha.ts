import { Request, Response, NextFunction } from "express";

export async function verifyRecaptcha(req: Request, res: Response, next: NextFunction) {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ 
      error: "Zero-Trust Block: Token de reCAPTCHA ausente." 
    });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LeZj-osAAAAAANGOOOSJC1xpGolAY0oGFtJWAZY";
    
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${recaptchaToken}`
    });

    const data = await response.json() as { success: boolean; [key: string]: any };

    if (!data.success) {
      return res.status(401).json({ 
        error: "Validación fallida: Google determinó que eres un bot o el token expiró." 
      });
    }

    next();
  } catch (error) {
    console.error("Error en auditoría reCAPTCHA:", error);
    return res.status(500).json({ error: "Error interno verificando seguridad reCAPTCHA." });
  }
}
