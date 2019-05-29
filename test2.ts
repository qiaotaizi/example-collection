class MyClass{

    constructor(){


    }

    myFunction():void{
        console.log(this);
    }

    member:number=1;

    //myFunction3:(param1:number,param2:number)=>void;

    myFunction2(param1:number,param2:number):void{
    }

}

new MyClass().myFunction();
