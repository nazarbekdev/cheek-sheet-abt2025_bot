document.addEventListener("DOMContentLoaded", function () {
    generateQuestions(1, 30, "mandatory");  // 1-30 Majburiy fanlar
    generateQuestions(31, 60, "subject1");  // 31-60 Fan 1
    generateQuestions(61, 90, "subject2");  // 61-90 Fan 2

    document.getElementById("testForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let answers = {};
        for (let i = 1; i <= 90; i++) {
            let selected = document.querySelector(`input[name="q${i}"]:checked`);
            answers[`q${i}`] = selected ? selected.value : null;
        }

        console.log("Tanlangan javoblar:", answers);
        document.getElementById("result").innerText = "Hisoblanmoqda...";
    });
});

function generateQuestions(start, end, containerId) {
    let container = document.getElementById(containerId);
    const options = ["A", "B", "C", "D"];
    
    for (let i = start; i <= end; i++) {
        let div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `<label>${i} </label>`;
        
        options.forEach(option => {
            let label = document.createElement("label");
            label.className = "option";
            label.innerHTML = `
                <input type="radio" name="q${i}" value="${option}">
                <span>${option}</span>
            `;
            div.appendChild(label);
        });

        container.appendChild(div);
    }
}


// ✅ Kitob ID validatsiyasi
document.getElementById("bookId").addEventListener("input", function () {
    let bookIdInput = this.value.replace(/\D/g, ""); // Faqat raqam qabul qilish
    this.value = bookIdInput; // To'g'ri shaklga keltirish
    let errorDiv = document.getElementById("bookIdError");

    if (bookIdInput.length !== 7) {
        this.classList.add("invalid");
        errorDiv.style.display = "block";
    } else {
        this.classList.remove("invalid");
        errorDiv.style.display = "none";
    }
});

// ✅ Telegram ID validatsiyasi
document.getElementById("telegramId").addEventListener("input", function () {
    let telegramIdInput = this.value.replace(/\D/g, ""); // Faqat raqam kiritish
    this.value = telegramIdInput; // To'g'ri shaklga keltirish
    let errorDiv = document.getElementById("telegramIdError");

    if (telegramIdInput.length !== 10) {
        this.classList.add("invalid");
        errorDiv.style.display = "block";
    } else {
        this.classList.remove("invalid");
        errorDiv.style.display = "none";
    }
});

// ✅ Yuborish tugmasi bosilganda tekshirish
document.getElementById("submitBtn").addEventListener("click", function (event) {
    let bookIdInput = document.getElementById("bookId");
    let telegramIdInput = document.getElementById("telegramId");

    if (bookIdInput.value.length !== 7 || telegramIdInput.value.length !== 10) {
        alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
        event.preventDefault(); // Formani yuborishni to‘xtatish
    }
});