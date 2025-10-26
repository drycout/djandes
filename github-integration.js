/**
 * GitHub Integration Library for DJANDES Bakery
 * Handles all GitHub API operations for data synchronization
 */

class GitHubIntegration {
    constructor() {
        this.config = this.loadConfig();
        this.baseUrl = 'https://api.github.com';
    }

    /**
     * Load GitHub configuration from localStorage
     */
    loadConfig() {
        const saved = localStorage.getItem('githubConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            username: 'drycout',
            repo: 'djandes-site',
            token: null
        };
    }

    /**
     * Save GitHub configuration to localStorage
     */
    saveConfig(config) {
        this.config = config;
        localStorage.setItem('githubConfig', JSON.stringify(config));
    }

    /**
     * Make authenticated request to GitHub API
     */
    async makeRequest(path, method = 'GET', data = null) {
        if (!this.config.token) {
            throw new Error('GitHub token not configured');
        }

        const url = `${this.baseUrl}/repos/${this.config.username}/${this.config.repo}/contents/${path}`;
        const headers = {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        const options = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get file content from GitHub
     */
    async getFile(path) {
        try {
            const response = await this.makeRequest(path);
            const content = atob(response.content);
            return JSON.parse(content);
        } catch (error) {
            if (error.message.includes('404')) {
                // File doesn't exist, return default data
                return this.getDefaultData(path);
            }
            throw error;
        }
    }

    /**
     * Save file content to GitHub
     */
    async saveFile(path, data, message = `Update ${path}`) {
        const content = JSON.stringify(data, null, 2);
        const encodedContent = btoa(content);

        try {
            // Try to get existing file first
            const existingFile = await this.makeRequest(path);
            
            // Update existing file
            return await this.makeRequest(path, 'PUT', {
                message,
                content: encodedContent,
                sha: existingFile.sha
            });
        } catch (error) {
            if (error.message.includes('404')) {
                // Create new file
                return await this.makeRequest(path, 'POST', {
                    message,
                    content: encodedContent
                });
            }
            throw error;
        }
    }

    /**
     * Get default data for new files
     */
    getDefaultData(path) {
        switch (path) {
            case 'data/products.json':
                return [
                    {
                        id: 1,
                        name: "Roti Tawar Premium",
                        categoryId: 1,
                        price: 25000,
                        stock: 50,
                        discount: 0,
                        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        description: "Roti tawar lembut dengan kualitas premium"
                    },
                    {
                        id: 2,
                        name: "Croissant Butter",
                        categoryId: 1,
                        price: 18000,
                        stock: 30,
                        discount: 10,
                        image: "https://images.unsplash.com/photo-1555507032-abfa424c5b2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        description: "Croissant butter yang renyah dan lezat"
                    },
                    {
                        id: 3,
                        name: "Donat Glaze",
                        categoryId: 2,
                        price: 12000,
                        stock: 25,
                        discount: 0,
                        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        description: "Donat dengan glaze manis"
                    },
                    {
                        id: 4,
                        name: "Brownies Coklat",
                        categoryId: 2,
                        price: 35000,
                        stock: 20,
                        discount: 15,
                        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        description: "Brownies coklat yang lembut dan moist"
                    },
                    {
                        id: 5,
                        name: "French Baguette",
                        categoryId: 1,
                        price: 22000,
                        stock: 15,
                        discount: 0,
                        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                        description: "Baguette Perancis yang autentik"
                    }
                ];
            case 'data/categories.json':
                return [
                    {
                        id: 1,
                        name: "Roti",
                        description: "Berbagai macam roti segar"
                    },
                    {
                        id: 2,
                        name: "Kue",
                        description: "Aneka kue manis dan lezat"
                    },
                    {
                        id: 3,
                        name: "Pastry",
                        description: "Pastry premium dengan rasa internasional"
                    }
                ];
            case 'data/orders.json':
                return [];
            case 'data/contacts.json':
                return [];
            case 'data/website.json':
                return {
                    name: "DJANDES Bakery",
                    email: "info@djandesbakery.com",
                    phone: "+62 21 1234 5678",
                    address: "Jl. Bakery No. 123, Jakarta, Indonesia",
                    description: "DJANDES Bakery telah melayani pelanggan sejak 2010 dengan komitmen untuk memberikan produk roti dan kue berkualitas tinggi."
                };
            default:
                return null;
        }
    }

    /**
     * Products API methods
     */
    async getProducts() {
        return await this.getFile('data/products.json');
    }

    async addProduct(productData) {
        const products = await this.getProducts();
        const newProduct = {
            id: Date.now(),
            ...productData
        };
        products.push(newProduct);
        await this.saveFile('data/products.json', products, 'Add new product');
        return newProduct;
    }

    async updateProduct(productId, productData) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) {
            throw new Error('Product not found');
        }
        products[index] = { ...products[index], ...productData };
        await this.saveFile('data/products.json', products, `Update product ${productId}`);
        return products[index];
    }

    async deleteProduct(productId) {
        const products = await this.getProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        await this.saveFile('data/products.json', filteredProducts, `Delete product ${productId}`);
        return true;
    }

    /**
     * Categories API methods
     */
    async getCategories() {
        return await this.getFile('data/categories.json');
    }

    async addCategory(categoryData) {
        const categories = await this.getCategories();
        const newCategory = {
            id: Date.now(),
            ...categoryData
        };
        categories.push(newCategory);
        await this.saveFile('data/categories.json', categories, 'Add new category');
        return newCategory;
    }

    async updateCategory(categoryId, categoryData) {
        const categories = await this.getCategories();
        const index = categories.findIndex(c => c.id === categoryId);
        if (index === -1) {
            throw new Error('Category not found');
        }
        categories[index] = { ...categories[index], ...categoryData };
        await this.saveFile('data/categories.json', categories, `Update category ${categoryId}`);
        return categories[index];
    }

    async deleteCategory(categoryId) {
        const categories = await this.getCategories();
        const filteredCategories = categories.filter(c => c.id !== categoryId);
        await this.saveFile('data/categories.json', filteredCategories, `Delete category ${categoryId}`);
        return true;
    }

    /**
     * Orders API methods
     */
    async getOrders() {
        return await this.getFile('data/orders.json');
    }

    async saveOrder(orderData) {
        const orders = await this.getOrders();
        orders.push(orderData);
        await this.saveFile('data/orders.json', orders, `Save order ${orderData.id}`);
        return orderData;
    }

    async updateOrderStatus(orderId, newStatus) {
        const orders = await this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) {
            throw new Error('Order not found');
        }
        orders[index].status = newStatus;
        await this.saveFile('data/orders.json', orders, `Update order status ${orderId}`);
        return orders[index];
    }

    /**
     * Contacts API methods
     */
    async getContacts() {
        return await this.getFile('data/contacts.json');
    }

    async saveContact(contactData) {
        const contacts = await this.getContacts();
        contacts.push(contactData);
        await this.saveFile('data/contacts.json', contacts, `Save contact ${contactData.id}`);
        return contactData;
    }

    async deleteContact(contactId) {
        const contacts = await this.getContacts();
        const filteredContacts = contacts.filter(c => c.id !== contactId);
        await this.saveFile('data/contacts.json', filteredContacts, `Delete contact ${contactId}`);
        return true;
    }

    /**
     * Website configuration API methods
     */
    async getWebsiteConfig() {
        return await this.getFile('data/website.json');
    }

    async updateWebsiteConfig(configData) {
        await this.saveFile('data/website.json', configData, 'Update website configuration');
        return configData;
    }

    /**
     * Initialize data files (for first-time setup)
     */
    async initializeData() {
        try {
            // Check if data directory exists by trying to get one file
            await this.getProducts();
            console.log('Data already initialized');
        } catch (error) {
            console.log('Initializing data files...');
            
            // Create all default data files
            await this.saveFile('data/products.json', this.getDefaultData('data/products.json'), 'Initialize products data');
            await this.saveFile('data/categories.json', this.getDefaultData('data/categories.json'), 'Initialize categories data');
            await this.saveFile('data/orders.json', this.getDefaultData('data/orders.json'), 'Initialize orders data');
            await this.saveFile('data/contacts.json', this.getDefaultData('data/contacts.json'), 'Initialize contacts data');
            await this.saveFile('data/website.json', this.getDefaultData('data/website.json'), 'Initialize website configuration');
            
            console.log('Data files initialized successfully');
        }
    }

    /**
     * Test GitHub connection
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('');
            return {
                success: true,
                message: 'Connection successful',
                repo: response.full_name
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get repository information
     */
    async getRepoInfo() {
        try {
            const response = await this.makeRequest('');
            return {
                name: response.name,
                fullName: response.full_name,
                description: response.description,
                url: response.html_url,
                defaultBranch: response.default_branch
            };
        } catch (error) {
            throw new Error(`Failed to get repository info: ${error.message}`);
        }
    }

    /**
     * Backup all data
     */
    async backupData() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                products: await this.getProducts(),
                categories: await this.getCategories(),
                orders: await this.getOrders(),
                contacts: await this.getContacts(),
                website: await this.getWebsiteConfig()
            };
            
            const backupPath = `backups/backup-${Date.now()}.json`;
            await this.saveFile(backupPath, backup, `Create backup ${Date.now()}`);
            
            return {
                success: true,
                path: backupPath,
                timestamp: backup.timestamp
            };
        } catch (error) {
            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    /**
     * Restore data from backup
     */
    async restoreData(backupPath) {
        try {
            const backup = await this.getFile(backupPath);
            
            await this.saveFile('data/products.json', backup.products, 'Restore products from backup');
            await this.saveFile('data/categories.json', backup.categories, 'Restore categories from backup');
            await this.saveFile('data/orders.json', backup.orders, 'Restore orders from backup');
            await this.saveFile('data/contacts.json', backup.contacts, 'Restore contacts from backup');
            await this.saveFile('data/website.json', backup.website, 'Restore website config from backup');
            
            return {
                success: true,
                timestamp: backup.timestamp
            };
        } catch (error) {
            throw new Error(`Failed to restore backup: ${error.message}`);
        }
    }

    /**
     * Get all available backups
     */
    async getBackups() {
        try {
            const response = await this.makeRequest('backups');
            return response
                .filter(file => file.name.endsWith('.json'))
                .map(file => ({
                    name: file.name,
                    path: file.path,
                    size: file.size,
                    downloadUrl: file.download_url
                }))
                .sort((a, b) => b.name.localeCompare(a.name));
        } catch (error) {
            if (error.message.includes('404')) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Export data to JSON
     */
    async exportData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                products: await this.getProducts(),
                categories: await this.getCategories(),
                orders: await this.getOrders(),
                contacts: await this.getContacts(),
                website: await this.getWebsiteConfig()
            };
            
            return exportData;
        } catch (error) {
            throw new Error(`Failed to export data: ${error.message}`);
        }
    }

    /**
     * Import data from JSON
     */
    async importData(importData) {
        try {
            if (!importData.products || !importData.categories) {
                throw new Error('Invalid import data format');
            }
            
            await this.saveFile('data/products.json', importData.products, 'Import products');
            await this.saveFile('data/categories.json', importData.categories, 'Import categories');
            
            if (importData.orders) {
                await this.saveFile('data/orders.json', importData.orders, 'Import orders');
            }
            
            if (importData.contacts) {
                await this.saveFile('data/contacts.json', importData.contacts, 'Import contacts');
            }
            
            if (importData.website) {
                await this.saveFile('data/website.json', importData.website, 'Import website config');
            }
            
            return {
                success: true,
                message: 'Data imported successfully'
            };
        } catch (error) {
            throw new Error(`Failed to import data: ${error.message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubIntegration;
}