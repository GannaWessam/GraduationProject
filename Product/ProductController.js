const ProductService = require('./ProductService');

async function addProduct(req, res) {
    try {
        const result = await ProductService.addProduct(req.body);
        return res.status(201).json({ success: true, Product: result });
        
    } catch (err) {
        let msg = err.message;
        if (msg === 'missing_required_fields') 
            return res.status(400).json({ success: false, error: 'حقول مطلوبة ناقصة' });
    
        console.error(err);
        return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
        }
}
async function getProductByType(req, res) {
    try {
        const result = await ProductService.getProductByType(req.body);
        return res.status(201).json({ success: true, Product: result });
        
    } catch (err) {
        let msg = err.message;
        if (msg === 'missing_required_fields') 
            return res.status(400).json({ success: false, error: 'حقول مطلوبة ناقصة' });

        if (msg === 'not found service') 
            return res.status(400).json({ success: false, error: 'not found service' });
    
        console.error(err);
        return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
        }
}

module.exports = { addProduct ,getProductByType };