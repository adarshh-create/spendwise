        function createFloatingElements() {
            const container = document.querySelector('.floating-elements');
            for (let i = 0; i < 20; i++) {
                const element = document.createElement('div');
                element.className = 'floating-element';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%';
                element.style.animationDelay = Math.random() * 6 + 's';
                element.style.animationDuration = (4 + Math.random() * 4) + 's';
                container.appendChild(element);
            }
        }
        let bills = JSON.parse(localStorage.getItem('shoppingBills')) || [];
        const billForm = document.getElementById('billForm');
        const billsList = document.getElementById('billsList');
        document.addEventListener('DOMContentLoaded', function() {
            createFloatingElements();
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
            renderBills();
            updateAnalysis();
            
            document.getElementById('addBillBtn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                addBill();
            });
            
            document.getElementById('billForm').addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    addBill();
                }
            });
        });

        function addBill() {
            const storeName = document.getElementById('storeName').value.trim();
            const billDate = document.getElementById('billDate').value;
            const category = document.getElementById('category').value;
            const amount = document.getElementById('amount').value;
            
            if (!storeName || !billDate || !category || !amount) {
                alert('Please fill in all required fields');
                return;
            }
            
            const bill = {
                id: Date.now(),
                storeName: storeName,
                date: billDate,
                category: category,
                amount: parseFloat(amount),
                items: document.getElementById('items').value.split('\n').filter(item => item.trim())
            };
            
            bills.push(bill);
            localStorage.setItem('shoppingBills', JSON.stringify(bills));
            document.getElementById('storeName').value = '';
            document.getElementById('category').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('items').value = '';
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
            
            renderBills();
            updateAnalysis();
            
            const submitBtn = document.getElementById('addBillBtn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '✓ Added!';
            submitBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        }

        function renderBills() {
            if (bills.length === 0) {
                billsList.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                        </svg>
                        <p>No bills added yet. Start by adding your first shopping bill!</p>
                    </div>
                `;
                return;
            }

            const sortedBills = [...bills].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            billsList.innerHTML = sortedBills.map(bill => `
                <div class="bill-item">
                    <div>
                        <span>${bill.storeName}</span>
                        <div style="font-size: 0.8rem; color: #718096; margin-top: 2px;">
                            ${new Date(bill.date).toLocaleDateString()} • ${bill.category}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span>$${bill.amount.toFixed(2)}</span>
                        <button class="delete-btn" onclick="deleteBill(${bill.id})" style="margin-left: 10px;">✕</button>
                    </div>
                </div>
            `).join('');
        }

        function deleteBill(id) {
            bills = bills.filter(bill => bill.id !== id);
            localStorage.setItem('shoppingBills', JSON.stringify(bills));
            renderBills();
            updateAnalysis();
        }

        function updateAnalysis() {
            const totalSpent = bills.reduce((sum, bill) => sum + bill.amount, 0);
            const billCount = bills.length;
            const avgBill = billCount > 0 ? totalSpent / billCount : 0;
            
            const categorySpending = bills.reduce((acc, bill) => {
                acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
                return acc;
            }, {});
            
            const topCategory = Object.keys(categorySpending).reduce((a, b) => 
                categorySpending[a] > categorySpending[b] ? a : b, '-'
            );
            
            document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
            document.getElementById('billCount').textContent = billCount;
            document.getElementById('avgBill').textContent = `₹${avgBill.toFixed(2)}`;
            document.getElementById('topCategory').textContent = topCategory;
            
            updateChart(categorySpending, totalSpent);
        }

        function updateChart(categorySpending, totalSpent) {
            const chartBars = document.getElementById('chartBars');
            
            if (totalSpent === 0) {
                chartBars.innerHTML = '<p style="text-align: center; color: #a0aec0;">No spending data available</p>';
                return;
            }
            
            const sortedCategories = Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a);
            
            chartBars.innerHTML = sortedCategories.map(([category, amount]) => {
                const percentage = (amount / totalSpent) * 100;
                return `
                    <div class="chart-bar">
                        <div class="chart-label">${category}</div>
                        <div class="chart-progress">
                            <div class="chart-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="chart-value">₹${amount.toFixed(2)}</div>
                    </div>
                `;
            }).join('');
        }

        document.addEventListener('mousemove', function(e) {
            const floatingElements = document.querySelectorAll('.floating-element');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            floatingElements.forEach((element, index) => {
                const speed = (index % 3 + 1) * 0.5;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;
                element.style.transform = `translate(${x}px, ${y}px)`;
            });
        });       
        function createFloatingElements() {
            const container = document.querySelector('.floating-elements');
            for (let i = 0; i < 20; i++) {
                const element = document.createElement('div');
                element.className = 'floating-element';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%';
                element.style.animationDelay = Math.random() * 6 + 's';
                element.style.animationDuration = (4 + Math.random() * 4) + 's';
                container.appendChild(element);
            }
        }
        let bills = JSON.parse(localStorage.getItem('shoppingBills')) || [];
        const billForm = document.getElementById('billForm');
        const billsList = document.getElementById('billsList');

        document.addEventListener('DOMContentLoaded', function() {
            createFloatingElements();
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
            renderBills();
            updateAnalysis();
            
            document.getElementById('addBillBtn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                addBill();
            });
            
            document.getElementById('billForm').addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    addBill();
                }
            });
        });

        function addBill() {
            const storeName = document.getElementById('storeName').value.trim();
            const billDate = document.getElementById('billDate').value;
            const category = document.getElementById('category').value;
            const amount = document.getElementById('amount').value;
            
            if (!storeName || !billDate || !category || !amount) {
                alert('Please fill in all required fields');
                return;
            }
            
            const bill = {
                id: Date.now(),
                storeName: storeName,
                date: billDate,
                category: category,
                amount: parseFloat(amount),
                items: document.getElementById('items').value.split('\n').filter(item => item.trim())
            };
            
            bills.push(bill);
            localStorage.setItem('shoppingBills', JSON.stringify(bills));
            document.getElementById('storeName').value = '';
            document.getElementById('category').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('items').value = '';
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
            
            renderBills();
            updateAnalysis();
            const submitBtn = document.getElementById('addBillBtn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '✓ Added!';
            submitBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        }

        function renderBills() {
            if (bills.length === 0) {
                billsList.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                        </svg>
                        <p>No bills added yet. Start by adding your first shopping bill!</p>
                    </div>
                `;
                return;
            }

            const sortedBills = [...bills].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            billsList.innerHTML = sortedBills.map(bill => `
                <div class="bill-item">
                    <div>
                        <span>${bill.storeName}</span>
                        <div style="font-size: 0.8rem; color: #718096; margin-top: 2px;">
                            ${new Date(bill.date).toLocaleDateString()} • ${bill.category}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span>$${bill.amount.toFixed(2)}</span>
                        <button class="delete-btn" onclick="deleteBill(${bill.id})" style="margin-left: 10px;">✕</button>
                    </div>
                </div>
            `).join('');
        }

        function deleteBill(id) {
            bills = bills.filter(bill => bill.id !== id);
            localStorage.setItem('shoppingBills', JSON.stringify(bills));
            renderBills();
            updateAnalysis();
        }

        function updateAnalysis() {
            const totalSpent = bills.reduce((sum, bill) => sum + bill.amount, 0);
            const billCount = bills.length;
            const avgBill = billCount > 0 ? totalSpent / billCount : 0;
            
            const categorySpending = bills.reduce((acc, bill) => {
                acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
                return acc;
            }, {});
            
            const topCategory = Object.keys(categorySpending).reduce((a, b) => 
                categorySpending[a] > categorySpending[b] ? a : b, '-'
            );
            
            document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
            document.getElementById('billCount').textContent = billCount;
            document.getElementById('avgBill').textContent = `₹${avgBill.toFixed(2)}`;
            document.getElementById('topCategory').textContent = topCategory;
            updateChart(categorySpending, totalSpent);
        }

        function updateChart(categorySpending, totalSpent) {
            const chartBars = document.getElementById('chartBars');
            
            if (totalSpent === 0) {
                chartBars.innerHTML = '<p style="text-align: center; color: #a0aec0;">No spending data available</p>';
                return;
            }
            
            const sortedCategories = Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a);
            
            chartBars.innerHTML = sortedCategories.map(([category, amount]) => {
                const percentage = (amount / totalSpent) * 100;
                return `
                    <div class="chart-bar">
                        <div class="chart-label">${category}</div>
                        <div class="chart-progress">
                            <div class="chart-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="chart-value">₹${amount.toFixed(2)}</div>
                    </div>
                `;
            }).join('');
        }
        document.addEventListener('mousemove', function(e) {
            const floatingElements = document.querySelectorAll('.floating-element');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            floatingElements.forEach((element, index) => {
                const speed = (index % 3 + 1) * 0.5;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;
                element.style.transform = `translate(${x}px, ${y}px)`;
            });
        });