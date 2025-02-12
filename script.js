document.addEventListener("DOMContentLoaded", function () {
    generateQuestions(1, 30, "mandatory");  
    generateQuestions(31, 60, "subject1");  
    generateQuestions(61, 90, "subject2");  

    document.getElementById("testForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        // Tugmani yashirish
        document.getElementById("submitButton").style.display = "none";

        document.getElementById("result").innerText = "♻️ Tekshirilmoqda...";

        const telegramId = document.getElementById("telegramId").value;
        const bookId = document.getElementById("bookId").value;

        if (!telegramId || !bookId) {
            alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
            return;
        }

        try {
            // 1. Foydalanuvchini tekshirish
            let userInfo = await fetchAPI(`https://testifyhub.uz/api/v1/block-test-info/${telegramId}`);
            if (!userInfo || userInfo.status === "yakunlandi" || userInfo.status === "topshirmadi") {
                alert(`Siz allaqachon testni yakunlagansiz yoki topshirmagansiz!`);
                return;
            }

            // 2. To‘g‘ri javoblarni olish
            let correctAnswers = await fetchAPI(`https://uzcamtest.site/api/answer/${bookId}`);
            if (!correctAnswers || !correctAnswers.answers) {
                alert(`'${bookId}' raqamli kitobcha mavjud emas!\nKitobcha raqamini to'g'ri kiriting.`);
                return;
            }

            correctAnswers = JSON.parse(correctAnswers.answers.replace(/'/g, '"')); // JSON formatga o'tkazish

            // 3. Foydalanuvchi javoblarini yig‘ish
            let userAnswers = {};
            for (let i = 1; i <= 90; i++) {
                let selected = document.querySelector(`input[name="q${i}"]:checked`);
                userAnswers[i] = selected ? selected.value : null;
            }

            // 4. Javoblarni tekshirish va natijalarni hisoblash
            let majburiyCorrect = 0, fan1Correct = 0, fan2Correct = 0;

            for (let i = 0; i < 90; i++) {
                let questionLabel = document.getElementById(`question-${i+1}`);
                if (!questionLabel) continue;  // Agar element topilmasa, davom etamiz
                
                if (userAnswers[i+1] && correctAnswers[i] && userAnswers[i+1] === correctAnswers[i][i+1]) {
                    if (i+1 <= 30) majburiyCorrect++;
                    else if (i+1 <= 60) fan1Correct++;
                    else fan2Correct++;
            
                    questionLabel.innerHTML += " ✅";
                } else {
                    questionLabel.innerHTML += " ❌";
                }
            }
            

            let majburiyBall = majburiyCorrect * 1.1;
            let fan1Ball = fan1Correct * 3.1;
            let fan2Ball = fan2Correct * 2.1;
            let totalBall = majburiyBall + fan1Ball + fan2Ball;

            // 5. Natijani bazaga saqlash
            let saveResult = await fetch("https://testifyhub.uz/api/v1/natijalar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    telegram_id: telegramId,
                    ism: userInfo.ism_familiya,
                    viloyat: userInfo.viloyat,
                    blok1: userInfo.fan1,
                    blok2: userInfo.fan2,
                    majburiy: majburiyCorrect,
                    fan1: fan1Correct,
                    fan2: fan2Correct,
                    ball: +totalBall.toFixed(1),
                    javoblari: Object.values(userAnswers).join("")
                })
            });

            if (!saveResult.ok) throw new Error("Natijalarni saqlashda xatolik!");

            // 6. Statusni 'yakunlandi'ga o‘zgartirish
            let response = await fetch(`https://testifyhub.uz/api/v1/block-test-patch/${telegramId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json" 
                },
                body: JSON.stringify({ 
                    "status": "yakunlandi" 
                }) 
            });
            
            document.getElementById("result").innerText = `\nIsm: ${userInfo.ism_familiya}\n\nMajburiy fanlar: ${majburiyCorrect}\n${userInfo.fan1}: ${fan1Correct}\n${userInfo.fan2}: ${fan2Correct}\n\nUmumiy ball: ${+totalBall.toFixed(1)}`;
        } catch (error) {
            console.error(error);
            alert("Xatolik yuz berdi, qayta urinib ko‘ring!");
        }
    });
});

// API ma'lumotlarni olish uchun umumiy funksiya
async function fetchAPI(url) {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error(`API xatolik: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API dan ma'lumot olishda xatolik:", error);
        return null;
    }
}

// Test savollarini yaratish
function generateQuestions(start, end, containerId) {
    let container = document.getElementById(containerId);
    const options = ["A", "B", "C", "D"];
    
    for (let i = start; i <= end; i++) {
        let div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `<label id="question-${i}">${i}</label>`;  // ID qo‘shildi
        
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


// **Kitob ID tekshirish**
document.getElementById("bookId").addEventListener("input", function () {
    let errorDiv = document.getElementById("bookIdError");
    this.value = this.value.replace(/\D/g, ""); // Faqat raqam
    errorDiv.style.display = this.value.length !== 7 ? "block" : "none";
});

// **Telegram ID tekshirish**
document.getElementById("telegramId").addEventListener("input", function () {
    let errorDiv = document.getElementById("telegramIdError");
    this.value = this.value.replace(/\D/g, ""); // Faqat raqam
    errorDiv.style.display = this.value.length !== 10 ? "block" : "none";
});

// **Yuborishdan oldin tekshirish**
document.getElementById("submitBtn").addEventListener("click", function (event) {
    if (document.getElementById("bookId").value.length !== 7 || document.getElementById("telegramId").value.length !== 10) {
        alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
        event.preventDefault();
    }
});
