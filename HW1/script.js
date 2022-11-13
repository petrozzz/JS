//console.log(foo);
//mult_tab();

show_by2(1, 10, false);
console.log(my_sum(1,1,1,1,1));

function my_sum(...arr){
   let summ = 0;
   if(arr.length <= 5){      
      for(let el of arr){
         summ += el;
      }
   }
   return summ;
}

function show_by2(st, en, is_odd){
   let counter = st;
   if((st%2 === 0) ^ is_odd){
      ++counter;            
   }
   while(counter < en){
      console.log(counter);
      counter += 2;
   }
}

function foo(a,b,c){
   return a * b * c;
}

  function task1(){
   let a = +prompt("Введите число: ");
   console.log(`Ваше число ${a}`);
   console.log(`Квадрат ${a**2}`);
  }            

  function task3(){
   const KM_MILL = 0.62137;
   let a = +prompt("Введите в киломметрах: ");
   console.log(`Ваши километры ${a}`);
   console.log(`Милли ${a*km_mill}`);
  }            

  function task7(){
   let h = +prompt("Введите часы: ");
   let m = +prompt("Введите минуты: ");
   console.log(`Ваше время ${h}:${m}`);
   if(m > 0)
      console.log(`Осталось ${24 - h - 1} часов и ${60 - m} минут.`);
   else
      console.log(`Осталось ровно ${24 - h} часов.`);    
  }

  function task9(){   
   let q1 = +prompt("В каком году было ледовое побоище?\n 1. 1342\n 2. 1242\n 3. 1442\n");
   let q2 = +prompt("Что является повиинностью крепостных крестьян?\n 1. Барщина\n 2. Фамилия\n 3. Бракосочетание\n");
   let q3 = +prompt("Когда было первое упоминание о Москве?\n 1. 1447\n 2. 1347\n 3. 1747\n");
   ball = (q1 === 2) + (q2 === 1) + (q3 === 1);
   alert(`Ваша оценка ${2 + ball}`);
  }

  function mult_tab(){
   let str = "";
   for(let k = 2; k <= 9; k++){
      str = "";
      for(let m = 2; m <= 9; m++){
         str += `\t\t${k} x ${m} = ${m*k}`;
      }
      console.log(`${str}\n`);
   }
  }