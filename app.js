//Budget Module/Controller
var budgetController = (function() {
    
    var expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current, index, array) {
            sum += current.value;
        }) 
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, description, value) {
            var newItem, ID;
            
            //Create New ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create New Item on input
            if(type === 'exp') {
                newItem = new expense(ID, description, value);
            } else if(type === 'inc') {
                newItem = new income(ID, description, value);
            }
            
            //Push it into data structure
            data.allItems[type].push(newItem);
            
            //Return the item
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            //Returing indexs of all items
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            //Remove item from array using splice
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {    
            //Calculate total income & expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current, index, array) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        getData: function() {
            console.log(data);
        }
    }
    
})();


//UI Module/Controller
var uiController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputText: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length)
            }
            
            dec = numSplit[1];
            
            ;
            
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputText).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
              var html;
            
            //Create HTML code with placeholder
              if(type === 'inc') {
                  element = DOMStrings.incomeContainer;
                  
                  html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
              }  else if(type === 'exp') {
                  element = DOMStrings.expensesContainer;
                  
                  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
              }
            
            //Replace HTML placeholder with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            
            //Place it into HTML
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(id) {
            //To remove an item from javascript we have to remove a child from it's parent node
            document.getElementById(id).parentNode.removeChild(document.getElementById(id))
        },
        
        displayDate: function() {
            var now, month, year, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            
            month = months[now.getMonth()];
            
            year = now.getFullYear();
            
            document.querySelector(DOMStrings.dateLabel).textContent = "";
            document.querySelector(DOMStrings.dateLabel).textContent = month + ', ' + year;
        },
        
        clearFields: function() {
            var fields, fieldArr;
            
            fields = document.querySelectorAll(DOMStrings.inputText + ', ' + DOMStrings.inputValue);
            
            fieldArr = Array.prototype.slice.call(fields);
            
            fieldArr.forEach(function(current, index, fieldArr) {
                current.value = "";
            });
            
            fieldArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
            
            
        },
        
        displayPercentages: function(percentages) {
            
            //Return list
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "--";
                }
            });
        },
        
        changedType: function() {
          
            var fields;
            
            fields = document.querySelectorAll(DOMStrings.inputType + ',' +
                                              DOMStrings.inputText + ',' +
                                              DOMStrings.inputValue);
            
            var nodeListForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index) {
                current.classList.toggle('red-focus');
            });
            
        },
        
        getDOM: function() {
            return DOMStrings;
        }
    };
    
})();


//General Controller that connect both budgetController and uiController
var controller = (function(budgetCtrl, uiCtrl) {
    
    var setupEventListener = function() {     
        var DOM = uiCtrl.getDOM();
        
        //If add button is pressed
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        //If enter key pressed
        document.addEventListener('keypress', function(event) {

            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        })
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);
    };
    
    
    var updatePercentages = function() {
        //Calculate percentages
        budgetCtrl.calculatePercentages();
        
        //Get percentages
        var percentages = budgetCtrl.getPercentages();
        
        //Update UI and display percentages
        uiCtrl.displayPercentages(percentages);
    };
    
    
    var updateBudget = function() {
        var budget;
        
        //Calculate the budget
        budgetCtrl.calculateBudget();
        
        //Return the budget
        budget = budgetCtrl.getBudget();
        
        //Show info into UI
        uiCtrl.displayBudget(budget);
    }
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        //Get input field data
        input = uiCtrl.getInput();
        
        //Check if description field is empty and if value field is not a number
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add item in the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //Add the item in the UI
            uiCtrl.addListItem(newItem, input.type);

            //Clear Input fields
            uiCtrl.clearFields();

            //Calculate & Update the budget
            updateBudget();
            
            //Update Percentage of the entry
            updatePercentages();
        }
        
        
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;
        
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        
        if(itemID) {
            //Split Item ID
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }
        
        //Remove item from data object
        budgetCtrl.deleteItem(type, id);
        
        //Remove item from UI
        uiCtrl.deleteListItem(itemID);
        
        //Update budget and UI
        updateBudget();
        
        //Update Percentage of the entry
        updatePercentages();
        
    };
    
    return {
        
        init: function() {
            uiCtrl.displayDate();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
        
    };
    
})(budgetController, uiController);

controller.init();