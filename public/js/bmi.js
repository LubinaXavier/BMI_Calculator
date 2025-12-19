function calculateBMI() {
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const result = document.getElementById("result");

    if (!height || !weight) {
        result.innerHTML = "<p class='error'>Please enter all values</p>";
        return;
    }

    fetch("/api/bmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height, weight })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            result.innerHTML = `<p class="error">${data.error}</p>`;
        } else {
            result.innerHTML = `
                <p class="success">
                    BMI: <strong>${data.bmi}</strong><br>
                    Category: <strong>${data.category}</strong>
                </p>
            `;
        }
    });
}
