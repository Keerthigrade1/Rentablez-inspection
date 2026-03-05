export async function handler(event) {

  const body = JSON.parse(event.body)
  const image = body.image.split(",")[1]

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analyze this vehicle image and identify any visible damage like scratches, dents or cracks."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image
              }
            }
          ]
        }]
      })
    }
  )

  const data = await response.json()

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }
}
