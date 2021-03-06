// BUDGET CONTROLLER
var budgetController = (function() {
    
    //Function constructors
    var Expense = function(id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    //Container for budget data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length > 0 ) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
           //Create new item based on 'inc' or 'exp' type
            if(type === 'inc') {
                newItem = new Income(ID, desc, val);    
            } else if (type === 'exp') {
                newItem = new Expense(ID, desc, val);    
            }

            //Push it to our data structure
            data.allItems[type].push(newItem);

            //Return the new item
            return newItem;
        },

        removeItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(cur) {
                return cur.id     
            });
    
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculateBudget: function() {

            // Calculate total income and expanses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expanses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate of the percentage of income already spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },

        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },

        getPercentages: function() {

            var percArr = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return percArr;
        },

        testing: function() {
            console.log(data);
        }

    }

})();




// UI CONTROLLER
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        incomeTotal: '.budget__income--value',
        expensesTotal: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        budgetValue: '.budget__value',
        container: '.container',
        percentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var num, numSplit, int, dec;

        /*
        - coma after thousand
        - exactly 2 decimals
        - "+" or "-" sign before number
        */

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3 && int.length < 7) {
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, int.length);     
        } else if (int.length === 7) {
            int = int.substr(0, 1) + ',' + int.substr(1, 3) + ',' + int.substr(int.length -3, int.length); 
        }
    
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
           
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            if (type === 'inc') {
                element = document.querySelector(DOMstrings.incomeContainer);

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = document.querySelector(DOMstrings.expensesContainer);

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            element.insertAdjacentHTML('beforeend', newHTML);

        },

        removeListItem: function(id) {
            var element;

            element = document.getElementById(id);
            element.parentNode.removeChild(element);

        },

        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(cur){
                cur.value = "";
            })
            fields[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeTotal).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesTotal).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
            }
        },

        displayPercentage: function(array) {
           
            expenses = document.querySelectorAll(DOMstrings.percentage);

            nodeListForEach(expenses, function(cur, index) {
                if(array[index] > 0) {
                    cur.textContent = array[index] + '%';
                } else {
                    cur.textContent = "---";
                }
               
            });

            /*
            expensesArr = Array.prototype.slice.call(expenses);
            for (var i = 0; i < array.length; i++) {
                expensesArr[i].textContent = array[i] + '%';
            } 
            */


        },

        displayDate: function() {
            var now, month, months, year;

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                        DOMstrings.inputType + ',' +
                        DOMstrings.inputDescription + ',' +
                        DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {

                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    
    }

})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

     var updateBudget = function() {
         
         // 1. Calculate budget.
        budgetCtrl.calculateBudget();

        // 2. Return the budget value
        var budget = budgetCtrl.getBudget();
        
        // 3. Display budget on the UI.
        UICtrl.displayBudget(budget);
     };   

     var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Return the new percentages from budget controller
        var allPerc = budgetCtrl.getPercentages();

        // 3. Display the new percentages in UI
        UICtrl.displayPercentage(allPerc);
        
     };


    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get data from input.
        input = UICtrl.getInput();

        //input validation
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
           
            // 2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI.
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear input fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemID.split('-');
        type = splitID[0];
        id = parseInt(splitID[1]);
        

        // 1. Delete the item from data structure
        budgetCtrl.removeItem(type, id);

        // 2. Delete the item from UI
        UICtrl.removeListItem(itemID);

        // 3. Update and calculate the budget
        updateBudget();

        // 4. Calculate and update percentages
        updatePercentages();

    };


    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            })
            console.log('Application initialized');
        } 
    };


})(budgetController, UIController);


controller.init();