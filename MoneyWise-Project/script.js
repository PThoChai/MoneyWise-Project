// Function to format numbers with commas for Thai locale
function formatNumber(num) {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Main function that runs after the HTML document is fully loaded
document.addEventListener('DOMContentLoaded', function() {

  // --- Scroll to Top Button ---
  // This section handles the functionality of the "scroll to top" button
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    window.onscroll = () => {
      const isScrolled = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
      scrollToTopBtn.style.display = isScrolled ? "flex" : "none";
    };
    scrollToTopBtn.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  // --- Debt Planner Tool (on debt.html) ---
  const debtForm = document.getElementById('debt-form');
  if (debtForm) {
    // Select all necessary elements from the DOM
    const debtListDiv = document.getElementById('debt-list');
    const calculateBtn = document.getElementById('calculate-plan-btn');
    const planResultDiv = document.getElementById('plan-result');
    const totalPaymentInput = document.getElementById('total-payment-budget');
    let debts = []; // Array to store debt objects

    // Event listener for adding a new debt
    debtForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const nameInput = document.getElementById('debt-name');
      const balanceInput = document.getElementById('debt-balance');
      const interestInput = document.getElementById('debt-interest');
      const minPaymentInput = document.getElementById('debt-min-payment');

      // Validate inputs before adding
      if (!nameInput.value.trim()) {
        alert('กรุณาใส่ชื่อหนี้');
        nameInput.focus();
        return;
      }
      const balance = parseFloat(balanceInput.value);
      const interest = parseFloat(interestInput.value);
      const minPayment = parseFloat(minPaymentInput.value);

      if (isNaN(balance) || isNaN(interest) || isNaN(minPayment) || balance <= 0) {
        alert('กรุณากรอกข้อมูล "ยอดหนี้", "ดอกเบี้ย", และ "ยอดผ่อนขั้นต่ำ" เป็นตัวเลขที่ถูกต้อง และยอดหนี้ต้องมากกว่า 0');
        return;
      }

      // Add new debt to the array
      debts.push({
        id: Date.now(),
        name: nameInput.value,
        balance,
        interest,
        minPayment
      });

      renderDebts();
      debtForm.reset();
      nameInput.focus();
    });

    // Function to display the list of debts
    function renderDebts() {
      debtListDiv.innerHTML = '';
      if (debts.length === 0) {
        debtListDiv.innerHTML = '<p class="placeholder-text">เมื่อเพิ่มรายการหนี้แล้ว หนี้ของคุณจะแสดงที่นี่...</p>';
      } else {
        debts.forEach(debt => {
          const debtItem = document.createElement('div');
          debtItem.className = 'debt-item';
          debtItem.innerHTML = `
            <div class="debt-info">
              <strong>${debt.name}</strong>
              <span>ยอดหนี้: ${debt.balance.toLocaleString('th-TH')} บาท | ดอกเบี้ย: ${debt.interest}% | จ่ายขั้นต่ำ: ${debt.minPayment.toLocaleString('th-TH')} บาท</span>
            </div>
            <button class="remove-btn" data-id="${debt.id}">ลบ</button>
          `;
          debtListDiv.appendChild(debtItem);
        });
      }
    }

    // Event listener for removing a debt from the list
    debtListDiv.addEventListener('click', function(event) {
      if (event.target.classList.contains('remove-btn')) {
        const debtIdToRemove = parseInt(event.target.getAttribute('data-id'));
        debts = debts.filter(debt => debt.id !== debtIdToRemove);
        renderDebts();
      }
    });
    
    // Event listener for calculating the debt-free plan
    calculateBtn.addEventListener('click', function() {
      const totalPaymentBudget = parseFloat(totalPaymentInput.value);
      const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);

      // Validate inputs for calculation
      if (debts.length === 0) {
        alert('กรุณาเพิ่มรายการหนี้ก่อนคำนวณ');
        return;
      }
      if (isNaN(totalPaymentBudget) || totalPaymentBudget <= 0) {
        alert('กรุณาใส่งบประมาณชำระหนี้ต่อเดือน');
        totalPaymentInput.focus();
        return;
      }
      if (totalPaymentBudget < totalMinPayment) {
        alert(`งบประมาณของคุณ (${totalPaymentBudget.toLocaleString('th-TH')}) น้อยกว่ายอดชำระขั้นต่ำรวม (${totalMinPayment.toLocaleString('th-TH')}) กรุณาเพิ่มงบประมาณ`);
        return;
      }

      // --- Avalanche Method Simulation ---
      let simulationDebts = JSON.parse(JSON.stringify(debts));
      let months = 0;
      let totalInterestPaid = 0;
      const initialTotalBalance = simulationDebts.reduce((sum, debt) => sum + debt.balance, 0);

      while (simulationDebts.reduce((sum, debt) => sum + debt.balance, 0) > 0) {
        months++;
        if (months > 600) { // Safety break after 50 years
          alert('ไม่สามารถคำนวณได้ อาจใช้เวลานานเกิน 50 ปี');
          return;
        }

        let monthBudget = totalPaymentBudget;
        
        // 1. Accrue interest for the month
        simulationDebts.forEach(debt => {
          const monthlyInterest = (debt.balance * (debt.interest / 100)) / 12;
          debt.balance += monthlyInterest;
          totalInterestPaid += monthlyInterest;
        });

        // 2. Sort debts by highest interest rate (Avalanche core)
        simulationDebts.sort((a, b) => b.interest - a.interest);

        // 3. Make payments
        for (let i = 0; i < simulationDebts.length; i++) {
          const debt = simulationDebts[i];
          let payment;

          if (i === 0) { // Highest interest debt gets the "avalanche"
            const otherMinPayments = simulationDebts.slice(1).reduce((sum, d) => sum + d.minPayment, 0);
            const availableForAvalanche = monthBudget - otherMinPayments;
            payment = Math.min(debt.balance, availableForAvalanche);
          } else { // Other debts get minimum payment
            payment = Math.min(debt.balance, debt.minPayment);
          }
          
          debt.balance -= payment;
          monthBudget -= payment;
        }

        // 4. Remove paid-off debts
        simulationDebts = simulationDebts.filter(debt => debt.balance > 0.01);
      }
      
      // --- Display Results ---
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      planResultDiv.style.display = 'block';
      planResultDiv.innerHTML = `
        <h4>ผลลัพธ์การคำนวณ (แบบ Avalanche)</h4>
        <p>คุณจะปลอดหนี้ในอีก: <strong>${years} ปี ${remainingMonths} เดือน</strong></p>
        <p>ยอดหนี้เริ่มต้น: <strong>${formatNumber(initialTotalBalance)}</strong> บาท</p>
        <p>ดอกเบี้ยที่จ่ายทั้งหมดโดยประมาณ: <strong>${formatNumber(totalInterestPaid)}</strong> บาท</p>
      `;
      planResultDiv.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- Emergency Fund Calculator (on saving.html) ---
  const emergencyFundForm = document.getElementById('emergency-fund-form');
  if (emergencyFundForm) {
    emergencyFundForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const housing = parseFloat(document.getElementById('ef-housing').value) || 0;
      const food = parseFloat(document.getElementById('ef-food').value) || 0;
      const transport = parseFloat(document.getElementById('ef-transport').value) || 0;
      const utilities = parseFloat(document.getElementById('ef-utilities').value) || 0;
      
      const totalMonthlyExpenses = housing + food + transport + utilities;
      const selectedMonthRadio = document.querySelector('input[name="ef-months"]:checked');
      
      if (!selectedMonthRadio) {
        alert('กรุณาเลือกระดับความมั่นคงของอาชีพ');
        return;
      }
      
      const months = parseInt(selectedMonthRadio.value);
      const recommendedFund = totalMonthlyExpenses * months;
      
      const efResultDiv = document.getElementById('ef-result');
      efResultDiv.style.display = 'block';
      efResultDiv.innerHTML = `
        <h4>ผลลัพธ์การคำนวณ</h4>
        <p>ค่าใช้จ่ายจำเป็นต่อเดือนของคุณคือ: <strong>${totalMonthlyExpenses.toLocaleString('th-TH')}</strong> บาท</p>
        <p>คุณควรมีเงินสำรองฉุกเฉินอย่างน้อย (${months} เดือน):</p>
        <p class="final-result"><strong>${formatNumber(recommendedFund)}</strong> บาท</p>
      `;
      efResultDiv.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- Risk Profile Calculator (on invest.html) ---
  const riskForm = document.getElementById('risk-calculator-form');
  if (riskForm) {
    riskForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const q1 = document.querySelector('input[name="q1"]:checked');
      const q2 = document.querySelector('input[name="q2"]:checked');
      const q3 = document.querySelector('input[name="q3"]:checked');

      if (!q1 || !q2 || !q3) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อ');
        return;
      }

      const score = parseInt(q1.value) + parseInt(q2.value) + parseInt(q3.value);

      let profile = '', description = '', profileClass = '';
      if (score <= 4) {
        profile = 'กลุ่มระมัดระวัง (Conservative)';
        profileClass = 'conservative';
        description = 'คุณเน้นการรักษาเงินต้นและรับความเสี่ยงได้น้อย เหมาะกับการลงทุนในตราสารหนี้, กองทุนรวมตลาดเงิน, หรือเงินฝากประจำ';
      } else if (score <= 7) {
        profile = 'กลุ่มสมดุล (Balanced)';
        profileClass = 'balanced';
        description = 'คุณรับความเสี่ยงได้ปานกลางและคาดหวังผลตอบแทนที่สูงขึ้น เหมาะกับการลงทุนในกองทุนรวมผสม, อสังหาริมทรัพย์, หรือผสมผสานระหว่างหุ้นและตราสารหนี้';
      } else {
        profile = 'กลุ่มกล้าเสี่ยง (Aggressive)';
        profileClass = 'aggressive';
        description = 'คุณรับความเสี่ยงได้สูงเพื่อแลกกับผลตอบแทนสูงสุด เหมาะกับการลงทุนในหุ้น, กองทุนรวมหุ้น, หรือการลงทุนทางเลือก';
      }
      
      const riskResultDiv = document.getElementById('risk-result');
      riskResultDiv.style.display = 'block';
      riskResultDiv.innerHTML = `
        <div class="risk-result-content ${profileClass}">
          <h4>ผลการประเมิน: คุณคือ "${profile}"</h4>
          <p>${description}</p>
        </div>
      `;
      riskResultDiv.scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // --- Investment Goal Planner (on invest.html) ---
  const goalForm = document.getElementById('goal-planner-form');
  if (goalForm) {
    goalForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const targetAmount = parseFloat(document.getElementById('goal-amount').value);
      const years = parseInt(document.getElementById('goal-years').value);
      const monthlySaving = parseFloat(document.getElementById('goal-monthly-saving').value);
      const expectedReturnRadio = document.querySelector('input[name="expected-return"]:checked');

      if (isNaN(targetAmount) || isNaN(years) || isNaN(monthlySaving) || !expectedReturnRadio) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        return;
      }

      const annualReturn = parseFloat(expectedReturnRadio.value) / 100;
      const monthlyReturn = annualReturn / 12;
      const totalMonths = years * 12;
      
      // Calculate Future Value using the formula
      const futureValue = monthlySaving * ( (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn );
      const shortfall = targetAmount - futureValue;

      // Prepare result HTML
      let resultHTML = `
        <h4>ผลลัพธ์การวางแผนเป้าหมาย</h4>
        <p>ถ้าคุณออมเดือนละ <strong>${monthlySaving.toLocaleString('th-TH')}</strong> บาท เป็นเวลา <strong>${years}</strong> ปี ด้วยผลตอบแทนคาดหวังปีละ <strong>${(annualReturn * 100)}%</strong>...</p>
        <p>เมื่อถึงวันนั้น คุณจะมีเงินประมาณ:</p>
        <p class="final-result"><strong>${formatNumber(futureValue)}</strong> บาท</p>
      `;

      if (shortfall <= 0) {
        resultHTML += `<p style="color: green; font-weight: bold; margin-top: 15px;">🎉 ยินดีด้วย! คุณจะบรรลุเป้าหมาย <strong>${targetAmount.toLocaleString('th-TH')}</strong> บาท ได้สำเร็จ</p>`;
      } else {
        resultHTML += `<p style="color: red; font-weight: bold; margin-top: 15px;">คุณยังขาดเงินอีก <strong>${formatNumber(shortfall)}</strong> บาท เพื่อให้ถึงเป้าหมาย</p>`;
        
        // Calculate how much more to save monthly
        const additionalMonthlySaving = (shortfall * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
        resultHTML += `<p>คุณต้องออมเพิ่มอีกประมาณเดือนละ <strong>${Math.ceil(additionalMonthlySaving).toLocaleString('th-TH')}</strong> บาท เพื่อให้บรรลุเป้าหมายนี้</p>`;
      }
      
      const goalResultDiv = document.getElementById('goal-result');
      goalResultDiv.style.display = 'block';
      goalResultDiv.innerHTML = resultHTML;
      goalResultDiv.scrollIntoView({ behavior: 'smooth' });
    });
  }

});