

// BUDGET CONTROLLER

var budgetController = (function (){

	var Expense = function(id,description,value){

		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome>0){
			this.percentage = Math.round((this.value/totalIncome) * 100);
		}else{
			this.percentage=-1;
		}
		
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id,description,value){

		this.id=id;
		this.description=description;
		this.value=value;
	};

	var data = {

		allItems : {
			exp : [],
			inc : []
		},
		totals: {
			exp : 0,
			inc : 0
		},
		budget : 0,
		percentage : -1,
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum+=cur.value;
		});
		data.totals[type]=sum;

	};

	return {

		addItem : function(typ,des,val){

			var newItem,ID;

			//Create the new id
			if (data.allItems[typ].length > 0) {
					ID=data.allItems[typ][data.allItems[typ].length - 1].id + 1;
			}else{
				ID=0;
			}

			//Create a new Item
			if(typ === 'exp'){
				newItem = new Expense(ID,des,val);
			}else if(typ === 'inc'){
				newItem = new Income(ID,des,val);
			}

			//Push the new item into the data
			data.allItems[typ].push(newItem);

			// Return the newitem for UI
			return newItem;
		},
		deleteItem : function(type, id){
			var ids,index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index=ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index,1);
			}

		},
		calculateBudget : function(){
			//Calculate total income and expenses 

			calculateTotal('exp');
			calculateTotal('inc');

			//Calculate the budget : income - expense
			data.budget = data.totals.inc - data.totals.exp;


			//calculate percentages
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else{
				data.percentage = -1;
			}
		},
		calculatePercentages : function(){

			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			})

		},
		getPercentages : function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget : function(){
			return {
				budget : data.budget,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp,
				percentage : data.percentage
			};
		},

		testing: function(){
			console.log(data);
		}

	};




})();




// UI CONTROLLER

var UIController = (function(){

	var DOMStrings = {

		inputType : '.add__type',
		inputDescription : '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incomeContainer : '.income__list',
		expenseContainer : '.expenses__list',
		budgetLabel : '.budget__value',
		incomeLabel : '.budget__income--value',
		expenseLabel : '.budget__expenses--value',
		percentageLabel : '.budget__expenses--percentage',
		container : '.container',
		expensesPercLabel : '.item__percentage',
		dateLabel : '.budget__title--month'

	};

	var formatNumbers = function(num, type){

			var numSplit,int,dec;
			num = Math.abs(num);
			num= num.toFixed(2);
			numSplit = num.split('.');
			int = numSplit[0];

			if (int.length > 3) {
				int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);//coverts 23456 to 23,456
			}
			dec = numSplit[1];

			return ( type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

		};
	var nodeListForEach = function(list, callback){
				for (var i = 0; i<list.length; i++) {
						 callback(list[i],i);
				}
		};


	return {

		getInput : function(){
			
			return {

				type : document.querySelector(DOMStrings.inputType).value, //It will be inc or exp
				description : document.querySelector(DOMStrings.inputDescription).value,
				value : parseFloat(document.querySelector(DOMStrings.inputValue).value)

			};
		},
		addListItem : function(obj, type){
			var html,newhtml,element;
			//Create HTML string with placeholder
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			}else if(type === 'exp'){
				element= DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';			

			}

			//Replace the string with actual data
			newhtml= html.replace('%id%',obj.id);
			newhtml=newhtml.replace('%description%',obj.description);
			newhtml=newhtml.replace('%value%',formatNumbers(obj.value, type));


			//Insert it into HTML DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
		},

		deleteListItem : function(selectorID){

			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);


		},

		clearFields : function(){
			var fields;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			filedsArray = Array.prototype.slice.call(fields);

			filedsArray.forEach(function(current,index,array){
				current.value="";
			});
			filedsArray[0].focus();

		},

		displayBudget : function(obj){

			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMStrings.budgetLabel).textContent=formatNumbers(obj.budget,type);
			document.querySelector(DOMStrings.incomeLabel).textContent=formatNumbers(obj.totalInc,'inc');
			document.querySelector(DOMStrings.expenseLabel).textContent=formatNumbers(obj.totalExp,'exp');
			

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent=obj.percentage + '%';
			}else{
				document.querySelector(DOMStrings.percentageLabel).textContent='---';
			}

		},

		displayPercentages : function(percentages){

			var fields= document.querySelectorAll(DOMStrings.expensesPercLabel);

			nodeListForEach(fields,function(current,index){
				if (percentages[index]>0) {
					current.textContent=percentages[index] + '%';
				}else{
					current.textContent='---';
				}
			});
		},
		displayMonth : function(){
			var now,year,months, month;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();

			months=['January','February','March','April','May','June','July','August','September','October','November','December'];


			document.querySelector(DOMStrings.dateLabel).textContent= months[month] + ' ' + year;

		},

		changedType : function(){

			var fields;
			fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDescription + ',' +
				DOMStrings.inputValue);

		nodeListForEach(fields, function(cur){
			cur.classList.toggle('red-focus');
		});

		document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

		},

		getDOMStrings : function(){

			return DOMStrings;
		}

	};

})();





// GLOBAL CONTROLLER THAT HAS ACCESS TO ABOVE BOTH CONTROLLER

var controller = (function(budgetCtrl, UICtrl){


	var setupEventListeners = function (){

		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);


		// event handler used to perform the add fucntion on press of enter
		document.addEventListener('keypress',function(event){ 


			if (event.keycode === 13 || event.which === 13) {

				ctrlAddItem();
			}

		});
		document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);


	};

	var updateBudget = function(){
		//Calculate the budget 
		budgetCtrl.calculateBudget();


		//Return the budget 
		var budget = budgetCtrl.getBudget();

		//Display the budget on UI
		//console.log(budget);
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function(){

		//Calculate the percentages
		budgetCtrl.calculatePercentages();

		//Read the percentages 

		var percentages = budgetCtrl.getPercentages();

		//Update them on UI
		UICtrl.displayPercentages(percentages);
	};


	var ctrlAddItem = function (){

		var input,newItem;
		// Get input data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

			//Add item for budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);

		// Add the item to the UI
		UICtrl.addListItem(newItem,input.type);

		//Clear fileds
		UICtrl.clearFields();

		//calculate and call updateBudget 
		updateBudget();

		//calculate and update percentages
		updatePercentages();

		}
		
	};

	var ctrlDeleteItem = function(event){
		var itemID,splitID,type,ID;
		itemID= (event.target.parentNode.parentNode.parentNode.parentNode.id);
		if (itemID) {

			splitID=itemID.split('-');
			type=splitID[0];
			ID=parseInt(splitID[1]);

			//Delete the item from the data structure
			budgetCtrl.deleteItem(type,ID);
			//Delete the item from UI
			UICtrl.deleteListItem(itemID);

			//Update and show the new Budget
			updateBudget();

			//update percentages
			updatePercentages();
		}


	};


	return {

		init : function(){

			console.log('Everything started with no errors');
			UICtrl.displayBudget({
				budget : 0,
				totalInc : 0,
				totalExp : 0,
				percentage : -1
			});
			setupEventListeners();
			UICtrl.displayMonth();

		}
	};
	
})(budgetController,UIController);


controller.init();