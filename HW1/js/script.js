console.clear();
myMain();
console.log('finish');

function myMain(){
   try{
      doTest(myGetMax, [[1, 1], [1,2], [2,1]], [0, -1, 1]);
      doTest(myFactorial, [[1], [3], [5]], [1, 6, 120]);
      doTest(myConcat, [[1,2,3], ['1','2','3'], ['a', 'b', ' ']],['123', '123', 'ab ']);
      doTest(myRectArea, [[3,4], [3], [5]],[12, 9, 25]);
      doTest(isPerfectNumber, [[10], [6], [33550336]],[false, true, true]);

      console.log("Test showPerfectNumber");
      showPerfectNumber(1, 10000);

      console.log("Test showTime");   
      showTime(12,0,0);
   
      doTest(timeToSeconds, [[1, 1, 40], [0, 0, 40], [0, 1, 40]],[3700, 40, 100]);
      doTest(secondsToTime, [[3700], [40], [100]],['01:01:40', '00:00:40', '00:01:40']);
      doTest(diffTime, [[12,0,0,13,0,0], [12,0,0,12,30,15], [12,0,0,12,30,16]],
         ['01:00:00', '00:30:15', '00:30:16']);   
   } catch(Error){
      console.log(Error.message);
   }   

   
}

function doTest(funName, list_args, list_result){
   if (typeof(funName) !== 'function') 
      throw(new Error("The funName must be a function."));
   if (list_args.length !== list_result.length)
      throw(new Error("The length of list_args and list_result must be equal."));
   console.log('Test ' + funName.name);
   list_result.forEach((res, id) => {
      console.log((funName.apply(this, list_args[id]) === res)? 'GOOD': 'BAD');      
   });    
}

function myGetMax(a, b){
   if (a > b) return 1;
   if (a < b) return -1;
   return 0;
}

function myFactorial(n){
   n1 = n;
   let res = 1;   
   while(n1 > 1){
      res *= n1--;
   }
   return res;
}

function myConcat(a, b, c){
   return String(a) + String(b) + String(c);
}

function myRectArea(a, b=a){
   return a * b;
}

function isPerfectNumber(a){
   let summ = 1;
   for(let k = 2; k <= a / 2; ++k)
      if((a % k) === 0) summ += k;
   return (summ === a); 
}

function showPerfectNumber(st, en){
   let str = "";
   for(let k = st; k <= en; ++k){
      if(isPerfectNumber(k)) str += k + ", ";
   }
   if(str.length > 0) console.log(str);
} 

function showTime(h, m = 0, s = 0){
   console.log(getStringTime(h, m, s)); 
}

function getStringTime(h, m = 0, s = 0){
   if (s < 10) s = "0" + s;
   if (m < 10) m = "0" + m;
   if (h < 10) h = "0" + h;
   return `${h}:${m}:${s}`; 
}

function timeToSeconds(h, m = 0, s = 0){
   return (h * 60 + m) * 60 + s; 
}

function secondsToTime(a){
   let s1 = a % (60 * 60 * 24);
   let h = Math.floor(s1 / (60 * 60));
   let m = Math.floor(s1 / 60) % 60; 
   let s = s1 % (60);  
   return getStringTime(h, m, s);
}

function diffTime(h1, m1, s1, h2, m2, s2){
   let secs1 = timeToSeconds(h1,m1,s1);
   let secs2 = timeToSeconds(h2,m2,s2);
   return secondsToTime(Math.abs(secs2 - secs1));
}

function myRecrusionCopy(ar1){
   let ar = [];
   for(let k in ar1){
      if(typeof(ar1[k]) == 'object'){
         ar[k] = myRecrusionCopy(ar1[k]);
      } else {
         ar[k] = ar1[k];
      }
   }
   return ar;
}

function myRecursionNOD(a, b){
   if (a > b)
      return myRecursionNOD(a - b, b);   
   if (a < b)
      return myRecursionNOD(a, b - a);
   return a; 
}

function myRecursionMaxDigit(n, max = 0){
   n = Math.abs(n);
   if(n > 0){
      val = n % 10;
      return myRecursionMaxDigit(Math.floor(n/10), (max < val)? val : max);
   } 
   return max;   
}

function myRecursionIsSimple(n, val = Math.floor(n/2)){
   if(n == 1 || val == 1)
      return true;
   if((n % val) !== 0)
      return myRecursionIsSimple(n, --val);
   else
      return false;
}

function myRecursionProducts(n, n0 = n, val = 2, res = ""){
   if(n == 1 || val >= n0/2)
      return (res.length > 0)? res.substring(0, res.length - 1): String(n);
   if((n % val) === 0)
      return myRecursionProducts(n/val, n0, val, res += val + "*");
   else{
      do{
         val++;
      } while ((val < n0/2) && (n % val) !== 0)
         if((n % val) === 0) 
            return myRecursionProducts(n/val, n0, val, res += val + "*");
         else 
            return (res.length > 0)? res.substring(0, res.length - 1): String(n);
   }
}

function myRecursionFibonachi(n){
  if(n < 0) return 0;
  if(n < 2) return 1;
  return myRecursionFibonachi(n-1) + myRecursionFibonachi(n - 2);
}