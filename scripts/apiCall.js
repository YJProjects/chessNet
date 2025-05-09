export default async function API(piece) {
    const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "example" })  // use "name" instead of "username"
    });
    const data = await response.json();
    console.log(data);
}
