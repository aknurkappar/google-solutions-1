export class Category {

  name : String;
  subCategories? : Category[];

  selected : boolean = false;

  constructor(name : String, subCategories : Category[]) {
    this.name = name;
    this.subCategories = subCategories;
  }

}

export const categories = [
  new Category( "Clothes", [
    new Category("Man's clothes", [
      new Category("Hoodie", []), new Category("T-Shirt", []), new Category("Shoes", [])
    ]),
    new Category("Woman's clothes", [
      new Category("Shoes", []), new Category("Dress", []), new Category("T-Shirt", [])
    ]),
  ]),
  new Category( "For babies", []),
  new Category( "Food", [
    new Category("Vegetables", [] ),
    new Category("Fruits", [] ),
  ]),
  new Category( "Home", []),
  new Category( "Travel", []),
]