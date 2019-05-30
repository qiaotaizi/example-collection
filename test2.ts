class MyClass{

    member1:number;

    constructor(member1:number){
        this.member1=member1;
        console.log("at constructor");
        console.log(this);
        console.log(this.member1);
        this.myFunction();
    }

    myFunction(){
        console.log("at myFunction");
        console.log(this);
        console.log(this.member1)
    }

}

let mc=new MyClass(1);

mc.myFunction();
