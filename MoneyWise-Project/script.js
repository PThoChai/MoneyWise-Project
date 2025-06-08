// รอให้หน้าเว็บโหลดเสร็จทั้งหมดก่อนเริ่มทำงาน
document.addEventListener('DOMContentLoaded', function() {

  // =================================================================
  // ===== ส่วนของปุ่มเลื่อนขึ้นบนสุด (Scroll to Top) =====
  // =================================================================
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    window.onscroll = () => {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopBtn.style.display = "flex";
      } else {
        scrollToTopBtn.style.display = "none";
      }
    };
    scrollToTopBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // =================================================================
  // ===== ส่วนของเครื่องมือวางแผนชำระหนี้ (Debt Planner) =====
  // =================================================================
  const debtForm = document.getElementById('debt-form');
  if (debtForm) {
    // ... โค้ดส่วนนี้เหมือนเดิมทั้งหมด ...
    const debtListDiv = document.getElementById('debt-list'); const calculateBtn = document.getElementById('calculate-plan-btn'); const planResultDiv = document.getElementById('plan-result'); const totalPaymentInput = document.getElementById('total-payment-budget'); let debts = []; debtForm.addEventListener('submit', function(event) { event.preventDefault(); const newDebt = { id: Date.now(), name: document.getElementById('debt-name').value, balance: parseFloat(document.getElementById('debt-balance').value), interest: parseFloat(document.getElementById('debt-interest').value), minPayment: parseFloat(document.getElementById('debt-min-payment').value) }; debts.push(newDebt); renderDebts(); debtForm.reset(); document.getElementById('debt-name').focus(); }); function renderDebts() { debtListDiv.innerHTML = ''; if (debts.length === 0) { debtListDiv.innerHTML = '<p class="placeholder-text">เมื่อเพิ่มรายการหนี้แล้ว หนี้ของคุณจะแสดงที่นี่...</p>'; } else { debts.forEach(debt => { const debtItem = document.createElement('div'); debtItem.className = 'debt-item'; debtItem.innerHTML = `<div class="debt-info"><strong>${debt.name}</strong><span>ยอดหนี้: ${debt.balance.toLocaleString('th-TH')} บาท | ดอกเบี้ย: ${debt.interest}% | จ่ายขั้นต่ำ: ${debt.minPayment.toLocaleString('th-TH')} บาท</span></div><button class="remove-btn" data-id="${debt.id}">ลบ</button>`; debtListDiv.appendChild(debtItem); }); } }
    debtListDiv.addEventListener('click', function(event) { if (event.target.classList.contains('remove-btn')) { const debtId = parseInt(event.target.getAttribute('data-id')); debts = debts.filter(debt => debt.id !== debtId); renderDebts(); } }); calculateBtn.addEventListener('click', function() { const totalPaymentBudget = parseFloat(totalPaymentInput.value); const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0); if (debts.length === 0) { alert('กรุณาเพิ่มรายการหนี้ก่อนคำนวณ'); return; } if (isNaN(totalPaymentBudget) || totalPaymentBudget <= 0) { alert('กรุณาใส่งบประมาณชำระหนี้ต่อเดือน'); totalPaymentInput.focus(); return; } if (totalPaymentBudget < totalMinPayment) { alert(`งบประมาณของคุณ (${totalPaymentBudget.toLocaleString('th-TH')}) น้อยกว่ายอดชำระขั้นต่ำรวม (${totalMinPayment.toLocaleString('th-TH')}) กรุณาเพิ่มงบประมาณ`); return; } let simulationDebts = JSON.parse(JSON.stringify(debts)); let months = 0; let totalInterestPaid = 0; const initialTotalBalance = simulationDebts.reduce((sum, debt) => sum + debt.balance, 0); while (simulationDebts.reduce((sum, debt) => sum + debt.balance, 0) > 0) { months++; if (months > 600) { alert('ไม่สามารถคำนวณได้ อาจใช้เวลานานเกิน 50 ปี'); return; } let monthBudget = totalPaymentBudget; let interestThisMonth = 0; simulationDebts.forEach(debt => { const monthlyInterest = (debt.balance * (debt.interest / 100)) / 12; debt.balance += monthlyInterest; interestThisMonth += monthlyInterest; }); totalInterestPaid += interestThisMonth; simulationDebts.sort((a, b) => b.interest - a.interest); for (let i = 0; i < simulationDebts.length; i++) { const debt = simulationDebts[i]; let payment; if (i === 0) { const otherMinPayments = simulationDebts.slice(1).reduce((sum, d) => sum + d.minPayment, 0); const availableForAvalanche = monthBudget - otherMinPayments; payment = Math.min(debt.balance, availableForAvalanche); } else { payment = Math.min(debt.balance, debt.minPayment); } debt.balance -= payment; monthBudget -= payment; } simulationDebts = simulationDebts.filter(debt => debt.balance > 0.01); } const years = Math.floor(months / 12); const remainingMonths = months % 12; planResultDiv.style.display = 'block'; planResultDiv.innerHTML = `<h4>ผลลัพธ์การคำนวณ (แบบ Avalanche)</h4><p>คุณจะปลอดหนี้ในอีก: <strong>${years} ปี ${remainingMonths} เดือน</strong></p><p>ยอดหนี้เริ่มต้น: <strong>${initialTotalBalance.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> บาท</p><p>ดอกเบี้ยที่จ่ายทั้งหมดโดยประมาณ: <strong>${totalInterestPaid.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> บาท</p>`; planResultDiv.scrollIntoView({ behavior: 'smooth' }); });
  }

  // =====================================================================
  // ===== ส่วนของเครื่องคำนวณเงินฉุกเฉิน (Emergency Fund) =====
  // =====================================================================
  const emergencyFundForm = document.getElementById('emergency-fund-form');
  if (emergencyFundForm) {
    // ... โค้ดส่วนนี้เหมือนเดิมทั้งหมด ...
    const efResultDiv = document.getElementById('ef-result'); emergencyFundForm.addEventListener('submit', function(event) { event.preventDefault(); const housing = parseFloat(document.getElementById('ef-housing').value) || 0; const food = parseFloat(document.getElementById('ef-food').value) || 0; const transport = parseFloat(document.getElementById('ef-transport').value) || 0; const utilities = parseFloat(document.getElementById('ef-utilities').value) || 0; const totalMonthlyExpenses = housing + food + transport + utilities; const selectedMonthRadio = document.querySelector('input[name="ef-months"]:checked'); if (!selectedMonthRadio) { alert('กรุณาเลือกระดับความมั่นคงของอาชีพ'); return; } const months = parseInt(selectedMonthRadio.value); const recommendedFund = totalMonthlyExpenses * months; efResultDiv.style.display = 'block'; efResultDiv.innerHTML = `<h4>ผลลัพธ์การคำนวณ</h4><p>ค่าใช้จ่ายจำเป็นต่อเดือนของคุณคือ: <strong>${totalMonthlyExpenses.toLocaleString('th-TH')}</strong> บาท</p><p>คุณควรมีเงินสำรองฉุกเฉินอย่างน้อย (${months} เดือน):</p><p class="final-result"><strong>${recommendedFund.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> บาท</p>`; efResultDiv.scrollIntoView({ behavior: 'smooth' }); });
  }

  // =====================================================================
  // ===== ส่วนของเครื่องมือประเมินความเสี่ยง (Risk Profile) =====
  // =====================================================================
  const riskForm = document.getElementById('risk-calculator-form');
  if (riskForm) {
    // ... โค้ดส่วนนี้เหมือนเดิมทั้งหมด ...
    const riskResultDiv = document.getElementById('risk-result'); riskForm.addEventListener('submit', function(event) { event.preventDefault(); const q1 = document.querySelector('input[name="q1"]:checked'); const q2 = document.querySelector('input[name="q2"]:checked'); const q3 = document.querySelector('input[name="q3"]:checked'); if (!q1 || !q2 || !q3) { alert('กรุณาตอบคำถามให้ครบทุกข้อ'); return; } const score = parseInt(q1.value) + parseInt(q2.value) + parseInt(q3.value); let profile = ''; let description = ''; let profileClass = ''; if (score <= 4) { profile = 'กลุ่มระมัดระวัง (Conservative)'; profileClass = 'conservative'; description = 'คุณเน้นการรักษาเงินต้นเป็นหลักและรับความเสี่ยงได้น้อย การลงทุนที่เหมาะสมคือ ตราสารหนี้, กองทุนรวมตลาดเงิน, หรือเงินฝากประจำ'; } else if (score <= 7) { profile = 'กลุ่มสมดุล (Balanced)'; profileClass = 'balanced'; description = 'คุณรับความเสี่ยงได้ปานกลางและคาดหวังผลตอบแทนที่สูงขึ้น การลงทุนที่เหมาะสมคือ กองทุนรวมผสม, อสังหาริมทรัพย์, หรือผสมผสานระหว่างหุ้นและตราสารหนี้'; } else { profile = 'กลุ่มกล้าเสี่ยง (Aggressive)'; profileClass = 'aggressive'; description = 'คุณรับความเสี่ยงได้สูงเพื่อแลกกับโอกาสรับผลตอบแทนสูงสุด การลงทุนที่เหมาะสมคือ หุ้น, กองทุนรวมหุ้น, หรือการลงทุนทางเลือกที่มีความเสี่ยงสูง'; } riskResultDiv.style.display = 'block'; riskResultDiv.innerHTML = `<div class="risk-result-content ${profileClass}"><h4>ผลการประเมิน: คุณคือ "${profile}"</h4><p>${description}</p></div>`; riskResultDiv.scrollIntoView({ behavior: 'smooth' }); });
  }
  
  // =====================================================================
  // ===== ส่วนของเครื่องมือวางแผนเป้าหมายการลงทุน (Goal Planner) =====
  // =====================================================================
  const goalForm = document.getElementById('goal-planner-form');
  if (goalForm) {
    const goalResultDiv = document.getElementById('goal-result');

    goalForm.addEventListener('submit', function(event) {
      event.preventDefault();

      // 1. ดึงข้อมูลจากฟอร์ม
      const targetAmount = parseFloat(document.getElementById('goal-amount').value);
      const years = parseInt(document.getElementById('goal-years').value);
      const monthlySaving = parseFloat(document.getElementById('goal-monthly-saving').value);
      const expectedReturnRadio = document.querySelector('input[name="expected-return"]:checked');

      // 2. ตรวจสอบข้อมูล
      if (isNaN(targetAmount) || isNaN(years) || isNaN(monthlySaving) || !expectedReturnRadio) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        return;
      }
      const annualReturn = parseFloat(expectedReturnRadio.value) / 100;

      // 3. คำนวณมูลค่าเงินในอนาคต (Future Value of an Annuity)
      const monthlyReturn = annualReturn / 12;
      const totalMonths = years * 12;
      
      // FV = P * [(((1 + r)^n) - 1) / r]
      const futureValue = monthlySaving * ( (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn );

      // 4. แสดงผลลัพธ์
      goalResultDiv.style.display = 'block';
      let resultHTML = `<h4>ผลลัพธ์การวางแผนเป้าหมาย</h4>`;
      resultHTML += `<p>ถ้าคุณออมเดือนละ <strong>${monthlySaving.toLocaleString('th-TH')}</strong> บาท เป็นเวลา <strong>${years}</strong> ปี ด้วยผลตอบแทนคาดหวังปีละ <strong>${(annualReturn * 100)}%</strong>...</p>`;
      resultHTML += `<p>เมื่อถึงวันนั้น คุณจะมีเงินประมาณ:</p>`;
      resultHTML += `<p class="final-result"><strong>${futureValue.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> บาท</p>`;

      const shortfall = targetAmount - futureValue;

      if (shortfall <= 0) {
        resultHTML += `<p style="color: green; font-weight: bold; margin-top: 15px;">🎉 ยินดีด้วย! คุณจะบรรลุเป้าหมาย <strong>${targetAmount.toLocaleString('th-TH')}</strong> บาท ได้สำเร็จ</p>`;
      } else {
        resultHTML += `<p style="color: red; font-weight: bold; margin-top: 15px;">คุณยังขาดเงินอีก <strong>${shortfall.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> บาท เพื่อให้ถึงเป้าหมาย</p>`;
        
        // คำนวณว่าต้องออมเพิ่มเดือนละเท่าไหร่
        // P = (FV * r) / (((1 + r)^n) - 1)
        const additionalMonthlySaving = (shortfall * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
        resultHTML += `<p>คุณต้องออมเพิ่มอีกประมาณเดือนละ <strong>${Math.ceil(additionalMonthlySaving).toLocaleString('th-TH')}</strong> บาท เพื่อให้บรรลุเป้าหมายนี้</p>`;
      }

      goalResultDiv.innerHTML = resultHTML;
      goalResultDiv.scrollIntoView({ behavior: 'smooth' });
    });
  }

});