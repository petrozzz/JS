console.clear();
myMain();

function myMain(){
   console.log("Test myGetMax");
   let res = "BAD";
   (myGetMax(1, 1) === 0) && (res = "GOOD");
   console.log(res);
   res = "BAD";
   (myGetMax(1, 2) === -1) && (res = "GOOD");
   console.log(res); 
   res = "BAD";
   (myGetMax(2, 1) === 1) && (res = "GOOD");
   console.log(res);
   
   console.log("Test myGetMax");
   res = "BAD";
   (myFactorial(1) === 1) && (res = "GOOD");
   console.log(res);
   res = "BAD";
   (myFactorial(3) === 6) && (res = "GOOD");
   console.log(res);
   res = "BAD";
   (myFactorial(5) === 120) && (res = "GOOD");
   console.log(res);
   
   console.log("Test myConcat");
   res = "BAD";
   (myConcat(1,2,3) === "123") && (res = "GOOD");
   console.log(res);
   res = "BAD";
   (myConcat("1","2","3") === "123") && (res = "GOOD");
   console.log(res);
   
   console.log("Test myRectArea");
   res = "BAD";
   (myRectArea(3,4) === 12) && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (myRectArea(3) === 9) && (res = "GOOD");
   console.log(res);

   console.log("Test isPerfectNumber");
   res = "BAD";
   (isPerfectNumber(10) === false) && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (isPerfectNumber(6) === true) && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (isPerfectNumber(33550336) === true) && (res = "GOOD");
   console.log(res);

   console.log("Test showPerfectNumber");
   showPerfectNumber(1, 10000);

   console.log("Test showTime");   
   showTime(12,0,0);

   console.log("Test timeToSeconds");
   res = "BAD";   
   (timeToSeconds(1, 1, 40) === 3700) && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (timeToSeconds(0, 0, 40) === 40) && (res = "GOOD");
   console.log(res);

   console.log("Test secondsToTime");
   res = "BAD";   
   (secondsToTime(3700) === "01:01:40") && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (secondsToTime(40) === "00:00:40") && (res = "GOOD");
   console.log(res);

   console.log("Test diffTime");
   res = "BAD";   
   (diffTime(12,0,0,13,0,0) === "01:00:00") && (res = "GOOD");
   console.log(res);
   res = "BAD";   
   (diffTime(12,0,0,12,30,15) === "00:30:15") && (res = "GOOD");
   console.log(res);
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