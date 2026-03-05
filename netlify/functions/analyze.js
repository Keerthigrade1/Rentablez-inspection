export async function handler(event) {

  const body = JSON.parse(event.body)
  const image = body.image

  // simple simulated analysis
  const probability = Math.random()

  let label = "No Damage"

  if (probability > 0.5) {
    label = "Possible Damage Detected"
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label: label,
      damage_probability: probability
    })
  }
}
