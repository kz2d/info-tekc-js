class Table {
  constructor(tableDocument, reductForm, plusButton, minusButton) {
    this.table = tableDocument;
    this.json = [];
    this.redactForm = reductForm;
    this.selected = "";
    this.itemsOnPage = 10;
    this.pageNumber = 0;
    this.sortSettings = { name: "", revers: false };
    //next page
    plusButton.onclick = () => {
      this.pageNumber +=
        (this.pageNumber + 1) * this.itemsOnPage >= this.json.length ? 0 : 1;
      this.render();
    };
    //previous page
    minusButton.onclick = () => {
      this.pageNumber -= this.pageNumber > 0 ? 1 : 0;
      this.render();
    };
    //set click on "submit" button in form tag
    this.redactForm.onsubmit = (e) => {
      //prevent reload of page
      e.preventDefault();
      //change val of selected document and resort and re-render
      this.setTableItem({
        id: this.selected,
        ...this.getRedactForm(this.redactForm),
      });
      //clear form
      this.setReductForm(false);
    };
  }

  render() {
    //clear table
    this.table.innerHTML = "";
    //add buttons for sorting elements
    this.table.appendChild(this.addSortButtons());
    //make slice of json to be "itemsOnPage" number
    for (const i of this.json.slice(
      this.pageNumber * this.itemsOnPage,
      this.pageNumber * this.itemsOnPage + this.itemsOnPage
    )) {
      this.table.appendChild(this.transformToHtml(i));
    }
  }

  async getData() {
    //load data.json from server
    let data = await fetch(origin + "/data.json");
    this.json = await data.json();
    //modifay data.json to prevent useless nesting
    for (const i of this.json) {
      i.firstName = i.name.firstName;
      i.lastName = i.name.lastName;
      delete i.name;
    }
    this.render();
  }
  onItemClick(item) {
    //This function is used to select one document in data.json
    return () => {
      this.selected = item.id;
      this.setReductForm(item);
    };
  }

  transformToHtml(obj) {
    //transform one item from data.json to htmlDocument
    const re = new RegExp("\\.", "g");
    let count = 0;
    let lastIndex = obj.about.length;
    //loop is searching for second dot and cut "about" to be shown with only two sentences
    for (let i = re.exec(obj.about); i; i = re.exec(obj.about)) {
      count++;
      if (count == 2) {
        lastIndex = i.index;
        break;
      }
    }
    const htmlString = `<td>${obj.firstName}</td>
      <td>${obj.lastName}</td>
      <td>${obj.about.substr(0, lastIndex)}${
      lastIndex != obj.about.length ? "..." : ""
    }</td>
      <td style="color:${obj.eyeColor}">${obj.eyeColor}</td>`;

    let tr = document.createElement("tr");
    tr.innerHTML = htmlString;
    //add onclick that set this item selected
    tr.onclick = this.onItemClick(obj);
    return tr;
  }

  sortJson(name, revers) {
    //sort and rerender json
    revers = revers ? -1 : 1;
    this.json.sort((a, b) =>
      a[name] < b[name] ? -1 * revers : a[name] > b[name] ? 1 * revers : 0
    );
    this.render();
  }

  addSortButtons() {
    //generate four buttons that apears on top of the table and sort elements by value
    let names = ["firstName", "lastName", "about", "eyeColor"];
    let tr = document.createElement("tr");
    for (const i of names) {
      let el = document.createElement("td");
      el.classList.add("sortButton");
      el.innerText = i;
      //set onclick to sort by name(exemple:firstName) and if it's selected revers json
      el.onclick = () => {
        let revers = false;
        if (this.sortSettings.name == i) {
          revers = !this.sortSettings.revers;
        }
        this.sortSettings.name = i;
        this.sortSettings.revers = revers;
        this.sortJson(i, revers);
      };
      tr.appendChild(el);
    }
    return tr;
  }

  setTableItem(item) {
    //update item in the data.json and rerender
    let index = this.json.findIndex((el) => el.id === item.id);
    if (index === -1) return;
    this.json[index] = item;
    this.render();
  }

  setReductForm(item) {
    //clear if item==false
    //else set form value to item and selected to item.id
    if (!item) {
      item = {
        firstName: "",
        lastName: "",
        phone: "",
        about: "",
        eyeColor: "",
      };
      this.selected = "";
    } else {
      this.selected = item.id;
    }
    //set input value to item value
    //can be optimized but that variant give more controll
    this.redactForm.children[0].value = item.firstName;
    this.redactForm.children[1].value = item.lastName;
    this.redactForm.children[2].value = item.phone;
    this.redactForm.children[3].value = item.about;
    this.redactForm.children[4].value = item.eyeColor;
  }
  getRedactForm() {
    //take redacted item from form
    return {
      firstName: this.redactForm.children[0].value,
      lastName: this.redactForm.children[1].value,

      phone: this.redactForm.children[2].value,
      about: this.redactForm.children[3].value,
      eyeColor: this.redactForm.children[4].value,
    };
  }
}
