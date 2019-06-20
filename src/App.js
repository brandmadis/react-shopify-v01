import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
// import Cart from './components/shopify/Cart';
import store from './store';
import axios from 'axios';
import { isImmutable } from '@babel/types';

// custom components
// import Nav from './components/Nav';
// import GenericProductsPage from './components/GenericProductsPage';

class App extends Component {
  state = {
    persons: [],
    collection: [],
    filtered: [],
    tags: [],
  }
  constructor() {
    super();
    this.updateQuantityInCart = this.updateQuantityInCart.bind(this);
    this.removeLineItemInCart = this.removeLineItemInCart.bind(this);
    this.handleCartClose = this.handleCartClose.bind(this);
    this.handleCartOpen = this.handleCartOpen.bind(this);
  }
  componentDidMount(){
    let body = `{
      collectionByHandle(handle: "new-stuff") {
        title
        handle
        products(first: 50) {
          edges {
            node {
              title
              tags
              images(first: 50) {
                edges {
                  node {
                    id
                    originalSrc
                  }
                }
              }
              variants(first: 3) {
                edges {
                  node {
                    title
                    sku
                    id
                  }
                }
              }
            }
          }
        }
      }
     }`
    axios.post(`https://targusdemo.myshopify.com/api/graphql`, body, 
    {
      headers: {
        'Content-Type': 'application/graphql',
        'X-Shopify-Storefront-Access-Token': '7f4147d95f2437e97a14e0e56ec1e443'
      }
    })
    .then(res => {
      
      this.setState({
        collection: res.data.data.collectionByHandle.products.edges,
        filtered: res.data.data.collectionByHandle.products.edges,
      })
    })
    .then(() => {
      let tags = []
      this.state.collection.forEach((item) => {
        // if one tag
        if(item.node.tags.length == 1){

          
          if(tags.indexOf(item.node.tags[0]) == -1){
            tags.push(item.node.tags[0])
          }
        } 
        // if multiple tags
        else if(item.node.tags.length > 1){
          item.node.tags.forEach((tag) => {
            if(tags.indexOf(tag == -1)){
              tags.push(tag)
            }
          })
        }
        
      })
      this.setState({tags})
    }
    )

  }
  updateQuantityInCart(lineItemId, quantity) {
    const state = store.getState(); // state from redux store
    const checkoutId = state.checkout.id
    const lineItemsToUpdate = [{id: lineItemId, quantity: parseInt(quantity, 10)}]
    state.client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then(res => {
      store.dispatch({type: 'UPDATE_QUANTITY_IN_CART', payload: {checkout: res}});
    });
  }
  removeLineItemInCart(lineItemId) {
    const state = store.getState(); // state from redux store
    const checkoutId = state.checkout.id
    state.client.checkout.removeLineItems(checkoutId, [lineItemId]).then(res => {
      store.dispatch({type: 'REMOVE_LINE_ITEM_IN_CART', payload: {checkout: res}});
    });
  }
  handleCartClose() {
    store.dispatch({type: 'CLOSE_CART'});
  }
  handleCartOpen() {
    store.dispatch({type: 'OPEN_CART'});
  }
  filterMens(){
    this.setState({ filtered: this.state.collection.filter(item => item.node.tags == "men")})
    // this.state.filtered.filter(item => {    //   return item.node.tags[0] == "men"
      // item.node.tags.includes("men") == true
    // })

    // const result = words.filter(word => word.length > 6);

  }
  filterWomens(){
    this.setState({ filtered: this.state.collection.filter(item => item.node.tags == "women")})
  }
  filter(filter){
    this.setState({ filtered: this.state.collection.filter(item => item.node.tags.indexOf(filter) != -1)})
  }
  resetFilter(){
    this.setState({ filtered: this.state.collection })
  }
  formatTag(item){
    return item.charAt(0).toUpperCase() + item.slice(1)
    // return string.charAt(0).toUpperCase() + string.slice(1);
  }
  render() {
    const state = store.getState(); // state from redux store
    // const collection = this.state.collection.map((item) => 
    //   <li>test</li>
    // )

    const filterButtons = this.state.tags.map((item, i) =>{
      return <button key={i} onClick={() => this.filter(item)}>
      { this.formatTag(item) }
      {/* { item } */}
      </button>
    })
    return (
      <div className="App">
        {/* <Nav handleCartOpen={this.handleCartOpen}/> */}
        <button onClick={()=>this.resetFilter()}>Clear Filters</button>
        { filterButtons }
        {/* <button onClick={() => this.filterMens()}>Mens</button>
        <button onClick={() => this.filterWomens()}>Womens</button> */}
        <ul style={{listStyle: 'none'}}>
        {
          this.state.filtered.map((item, i) => {
            return <li key={i}>
              <img src={item.node.images.edges[0].node.originalSrc} width="75px"/>
            {item.node.title}
            </li>
          })
        }
        </ul>
        {/* <Cart
          checkout={state.checkout}
          isCartOpen={state.isCartOpen}
          handleCartClose={this.handleCartClose}
          updateQuantityInCart={this.updateQuantityInCart}
          removeLineItemInCart={this.removeLineItemInCart}
         />
       <GenericProductsPage/> */}
      </div>
    );
  }
}
export default connect((state) => state)(App);