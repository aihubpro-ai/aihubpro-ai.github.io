let productCount = 0;
let logoBase64 = '';

// Auto Invoice Number
document.addEventListener('DOMContentLoaded', () => {
    const date = new Date();
    const invNo = 'INV-' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0') + '-' + Math.floor(Math.random() * 1000);
    document.getElementById('invoiceNo').value = invNo;
    document.getElementById('invoiceDate').valueAsDate = date;
    
    // Load draft
    const draft = localStorage.getItem('invoiceDraft');
    if (draft && confirm('Load saved draft?')) {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            if (document.getElementById(key)) document.getElementById(key).value = data[key];
        });
    }
    
    // Dark mode
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    document.getElementById('darkModeToggle').onclick = () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    };
    
    // Logo upload
    document.getElementById('logoUpload').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            logoBase64 = e.target.result;
            document.getElementById('logoPreview').src = logoBase64;
            document.getElementById('logoPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    };
    
    addProduct();
});

function addProduct() {
    productCount++;
    const div = document.createElement('div');
    div.className = 'product-row';
    div.innerHTML = `
        <input type="text" placeholder="Product Name" id="prodName${productCount}">
        <input type="number" placeholder="Qty" id="prodQty${productCount}" value="1" onchange="calculateTotal()">
        <input type="number" placeholder="Price" id="prodPrice${productCount}" onchange="calculateTotal()">
        <input type="number" placeholder="Disc %" id="prodDisc${productCount}" value="0" onchange="calculateTotal()">
        <button onclick="this.parentElement.remove()">❌</button>
    `;
    document.getElementById('productsList').appendChild(div);
}

function calculateTotal() {
    let subtotal = 0;
    document.querySelectorAll('.product-row').forEach((row, i) => {
        const qty = parseFloat(row.querySelector('[id^=prodQty]').value) || 0;
        const price = parseFloat(row.querySelector('[id^=prodPrice]').value) || 0;
        const disc = parseFloat(row.querySelector('[id^=prodDisc]').value) || 0;
        subtotal += qty * price * (1 - disc / 100);
    });
    
    const gstRate = parseFloat(document.getElementById('gstRate').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const shipping = parseFloat(document.getElementById('shipping').value) || 0;
    
    const afterDisc = subtotal * (1 - discount / 100);
    const gstAmount = afterDisc * gstRate / 100;
    const grandTotal = afterDisc + gstAmount + shipping;
    
    generatePreview(subtotal, afterDisc, gstAmount, shipping, grandTotal, gstRate);
}

function generatePreview(subtotal, afterDisc, gstAmount, shipping, grandTotal, gstRate) {
    const gstType = document.getElementById('gstType').value;
    let productsHTML = '';
    document.querySelectorAll('.product-row').forEach((row) => {
        const name = row.querySelector('[id^=prodName]').value;
        const qty = row.querySelector('[id^=prodQty]').value;
        const price = row.querySelector('[id^=prodPrice]').value;
        const disc = row.querySelector('[id^=prodDisc]').value;
        const total = qty * price * (1 - disc / 100);
        if (name) productsHTML += `<tr><td>${name}</td><td>${qty}</td><td>₹${price}</td><td>${disc}%</td><td>₹${total.toFixed(2)}</td></tr>`;
    });
    
    const html = `
        <h2>INVOICE</h2>
        ${logoBase64? `<img src="${logoBase64}" style="max-width:150px;">` : ''}
        <div style="display:flex; justify-content:space-between; margin:20px 0;">
            <div><strong>From:</strong><br>${document.getElementById('companyName').value}<br>${document.getElementById('companyAddress').value}<br>GST: ${document.getElementById('companyGST').value}</div>
            <div><strong>To:</strong><br>${document.getElementById('customerName').value}<br>${document.getElementById('customerAddress').value}<br>GST: ${document.getElementById('customerGST').value}</div>
        </div>
        <p><strong>Invoice No:</strong> ${document.getElementById('invoiceNo').value} | <strong>Date:</strong> ${document.getElementById('invoiceDate').value} | <strong>Due:</strong> ${document.getElementById('dueDate').value}</p>
        <table>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Disc</th><th>Total</th></tr>
            ${productsHTML}
        </table>
        <div class="total-box">
            <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
            ${document.getElementById('discount').value? `<p>Discount: ${document.getElementById('discount').value}%</p>` : ''}
            ${gstType === 'cgst_sgst'? `<p>CGST ${gstRate/2}%: ₹${(gstAmount/2).toFixed(2)}</p><p>SGST ${gstRate/2}%: ₹${(gstAmount/2).toFixed(2)}</p>` : `<p>IGST ${gstRate}%: ₹${gstAmount.toFixed(2)}</p>`}
            ${shipping? `<p>Shipping: ₹${shipping.toFixed(2)}</p>` : ''}
            <h3>Grand Total: ₹${grandTotal.toFixed(2)}</h3>
            <p><em>${numberToWords(grandTotal)}</em></p>
        </div>
        <div style="margin-top:30px;">
            <p><strong>Notes:</strong> ${document.getElementById('notes').value}</p>
            <p><strong>Terms:</strong> ${document.getElementById('terms').value}</p>
        </div>
    `;
    document.getElementById('invoicePreview').innerHTML = html;
    document.getElementById('invoicePreview').style.display = 'block';
}

function printInvoice() { calculateTotal(); window.print(); }

function downloadPDF() {
    calculateTotal();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(document.getElementById('invoicePreview'), {
        callback: (doc) => doc.save(document.getElementById('invoiceNo').value + '.pdf'),
        x: 10, y: 10, width: 190, windowWidth: 800
    });
}

function shareWhatsApp() {
    calculateTotal();
    const msg = `Invoice: ${document.getElementById('invoiceNo').value}\nTotal: ₹${document.querySelector('.total-box h3')?.textContent || ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

function saveDraft() {
    const data = {};
    document.querySelectorAll('input, textarea, select').forEach(el => { if (el.id) data[el.id] = el.value; });
    localStorage.setItem('invoiceDraft', JSON.stringify(data));
    alert('Draft Saved!');
}

function numberToWords(num) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return 'Zero Rupees Only';
    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000? ' ' + convert(n % 10000000) : '');
    };
    return convert(Math.floor(num)) + ' Rupees Only';
}
