import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import Cart from './components/shopify/Cart';
import store from './store';
import axios from 'axios';

// custom components
import Nav from './components/Nav';
import GenericProductsPage from './components/GenericProductsPage';

class App extends Component {
  state = {
    persons: [],
    collection: []
  }
  constructor() {
    super();
    this.updateQuantityInCart = this.updateQuantityInCart.bind(this);
    this.removeLineItemInCart = this.removeLineItemInCart.bind(this);
    this.handleCartClose = this.handleCartClose.bind(this);
    this.handleCartOpen = this.handleCartOpen.bind(this);
  }
  componentDidMount(){
    console.log("component did mount")
    let body = `{
      collectionByHandle(handle: "new-stuff") {
        title
        handle
        products(first: 5) {
          edges {
            node {
              title
              images(first: 5) {
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
      
      this.setState({collection: res.data.data.collectionByHandle.products.edges})
      console.log("res: ", this.state.collection)
    })

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
  render() {
    const state = store.getState(); // state from redux store
    // const collection = this.state.collection.map((item) => 
    //   <li>test</li>
    // )
    return (
      <div className="App">
        {/* <Nav handleCartOpen={this.handleCartOpen}/> */}
        <ul style={{listStyle: 'none'}}>
        {
          this.state.collection.map((item, i) => {
            console.log(item.node.title)
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