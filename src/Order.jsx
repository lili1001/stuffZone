import React, { Component } from "react";
import {
  format,
  formatDistance,
  formatRelative,
  subDays,
  parseISO
} from "date-fns";
import formatMoney from "./formatMoney";
import styled from "styled-components";
import { connect } from "react-redux";
import Review from "./Review.jsx";

const OrderStyles = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  border: 1px solid #ebebeb;
  box-shadow: 3px;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.5);

  border-top: 10px solid #696969;
  border-bottom: 10px solid #696969;
  & > p {
    display: grid;
    grid-template-columns: 1fr 5fr;
    margin: 0;
    border-bottom: 3px solid whitesmoke;
    span {
      padding: 1rem;
      &:first-child {
        font-weight: 900;
        text-align: right;
      }
    }
  }
  .order-item {
    border-bottom: 3px solid whitesmoke;
    display: grid;
    grid-template-columns: 300px auto;
    align-items: center;
    grid-gap: 2rem;
    margin: 2rem 0;
    padding-bottom: 2rem;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

class unconectedOrder extends Component {
  //orderId = routerData.match.params.orderId
  constructor(props) {
    super(props);
    this.state = {};
  }
  renderReview = itemData => {
    if (itemData.reviewed) {
      return <Review itemId={itemData.itemId}></Review>;
    }
  };
  addReview = () => {
    this.setState({ displayReview: true });
  };
  render() {
    console.log("order props", this.props.orders);

    let order = this.props.orders.filter(order => {
      return order.orderId === this.props.orderId;
    });

    console.log("order", order);

    let o = order[0];

    return (
      <>
        <OrderStyles>
          <p>
            <span>Order ID: </span>
            <span>{o.orderId}</span>
          </p>

          <p>
            <span>Order Date: </span>
            <span>{format(parseISO(o.createdAt), "MMMM d, yyyy h:mm a")}</span>
          </p>
          <p>
            <span>Order Total: </span>
            <span>{formatMoney(o.total)}</span>
          </p>
          <p>
            <span>Item Count: </span>
            <span>{o.items.length}</span>
          </p>

          <div className="items">
            {o.items.map(item => (
              <div className="order-item" key={item.itemId}>
                <img src={item.smallImage} alt={item.title} />
                <div className="item-details">
                  <h2>{item.title}</h2>
                  <p>Price: {formatMoney(item.price)}</p>

                  <p>{item.description}</p>
                  <Review
                    item={item}
                    itemId={item.itemId}
                    sellerId={item.sellerId}
                    orderId={this.props.orderId}
                    byItem={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </OrderStyles>
      </>
    );
  }
}

let mapStateToProps = st => {
  return {
    orders: st.orders
  };
};

let Order = connect(mapStateToProps)(unconectedOrder);

export default Order;
