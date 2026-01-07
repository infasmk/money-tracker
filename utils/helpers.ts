
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use UTC date to avoid timezone shift issues on formatted display
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    });
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const getTodayDateString = (): string => {
    const now = new Date();
    // Return YYYY-MM-DD format in local time
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
};

export const getMonthName = (monthIndex: number): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
};
