        let bills = [];
        
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
        
        function loadBills() {
            try {
                const stored = localStorage.getItem('shoppingBills');
                bills = stored ? JSON.parse(stored) : [];
            } catch (e) {
                bills = [];
            }
        }
        
        function saveBills() {
            try {
                localStorage.setItem('shoppingBills', JSON.stringify(bills));
            } catch (e) {
                alert('Error saving data. Storage might be full.');
            }
        }
        
        function addBill() {
            const storeName = document.getElementById('storeName').value.trim();
            const billDate = document.getElementById('billDate').value;
            const category = document.getElementById('category').value;
            const amount = document.getElementById('amount').value;
            const items = document.getElementById('items').value;
            
            if (!storeName) {
                alert('Please enter store name');
                document.getElementById('storeName').focus();
                return;
            }
            
            if (!billDate) {
                alert('Please select date');
                document.getElementById('billDate').focus();
                return;
            }
            
            if (!category) {
                alert('Please select category');
                document.getElementById('category').focus();
                return;
            }
            
            if (!amount || amount <= 0) {
                alert('Please enter valid amount');
                document.getElementById('amount').focus();
                return;
            }
            
            const newBill = {
                id: Date.now(),
                storeName: storeName,
                date: billDate,
                category: category,
                amount: parseFloat(amount),
                items: items.split('\n').filter(item => item.trim() !== ''),
                createdAt: new Date().toISOString()
            };
            
            bills.push(newBill);
            saveBills();
            clearForm();
            renderBills();
            updateStats();
            showSuccess();
        }
        
        function clearForm() {
            document.getElementById('storeName').value = '';
            document.getElementById('category').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('items').value = '';
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
        }
        
        function showSuccess() {
            const btn = document.getElementById('addBillBtn');
            const originalText = btn.textContent;
            
            btn.textContent = '✓ Bill Added Successfully!';
            btn.classList.add('success');
            
            setTimeout(function() {
                btn.textContent = originalText;
                btn.classList.remove('success');
            }, 2000);
        }
        
        function deleteBill(id) {
            if (confirm('Are you sure you want to delete this bill?')) {
                bills = bills.filter(bill => bill.id !== id);
                saveBills();
                renderBills();
                updateStats();
            }
        }
        
        function renderBills() {
            const billsList = document.getElementById('billsList');
            
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
                    <div class="bill-info">
                        <span>${bill.storeName}</span>
                        <div class="bill-meta">${formatDate(bill.date)} • ${bill.category}</div>
                    </div>
                    <div class="bill-amount">
                        <span class="bill-price">₹${bill.amount.toFixed(2)}</span>
                        <button class="delete-btn" onclick="deleteBill(${bill.id})">✕</button>
                    </div>
                </div>
            `).join('');
        }
        
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        }
        
        function updateStats() {
            const totalSpent = bills.reduce((sum, bill) => sum + bill.amount, 0);
            const billCount = bills.length;
            const avgBill = billCount > 0 ? totalSpent / billCount : 0;
            
            const categorySpending = {};
            bills.forEach(bill => {
                categorySpending[bill.category] = (categorySpending[bill.category] || 0) + bill.amount;
            });
            
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
            
            if (totalSpent === 0 || Object.keys(categorySpending).length === 0) {
                chartBars.innerHTML = '<p style="text-align: center; color: #a0aec0;">No spending data available</p>';
                return;
            }
            
            const sortedCategories = Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a);
            
            chartBars.innerHTML = sortedCategories.map(([category, amount]) => {
                const percentage = Math.max(5, (amount / totalSpent) * 100);
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
        
        function initApp() {
            createFloatingElements();
            document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
            loadBills();
            renderBills();
            updateStats();
            
            document.getElementById('addBillBtn').addEventListener('click', function(e) {
                e.preventDefault();
                addBill();
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    addBill();
                }
            });
            
            if (window.innerWidth > 768) {
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
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }