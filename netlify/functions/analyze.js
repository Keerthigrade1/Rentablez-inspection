export async function handler(event) {

const body = JSON.parse(event.body)

const image = body.image

return {
statusCode: 200,
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
result: "Image received for AI inspection",
damage_probability: "Analyzing..."
})
}

}
