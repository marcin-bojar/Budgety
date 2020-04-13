// BUDGET CONTROLLER
var budgetController = (function() {
    
    //Function constructors
    var Expense = function(id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
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

       /* totalCalc: function(obj, type) {
             
            data.totals[type] += obj.value;
            return data.totals[type];
        },*/

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
        budgetValue: '.budget__value'
    }

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

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = document.querySelector(DOMstrings.expensesContainer);

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            element.insertAdjacentHTML('beforeend', newHTML);

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
            
            document.querySelector(DOMstrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeTotal).textContent = '+ ' + obj.totalInc;
            document.querySelector(DOMstrings.expensesTotal).textContent = '- ' + obj.totalExp;
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
            }
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
    };

     var updateBudget = function() {
         
         // 1. Calculate budget.
        budgetCtrl.calculateBudget();

        // 2. Return the budget value
        var budget = budgetCtrl.getBudget();
        
        // 3. Display budget on the UI.
        UICtrl.displayBudget(budget);
     }   


    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get data from input.
        input = UICtrl.getInput();

        //input validation
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
           
            // 2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI.
            UIController.addListItem(newItem, input.type);

            // 4. Clear input fields
            UIController.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            })
            console.log('Application initialized');
        } 
    }


})(budgetController, UIController);


controller.init();