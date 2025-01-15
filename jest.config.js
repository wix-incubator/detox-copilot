module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};



class specialStack {

  

    constructor() {
      this.array = [];
    }




    push1(number : number) {
      //insert to stack 1
    }

    push2(number : number) {
       //insert to stack 2
    }
    pop2(number : number) {
      //remove the top item from stack 2
    }
    pop1(number : number) {
       //remove the top item from stack 1
    }





}