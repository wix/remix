---
id: why-remx
title: Why Remx
sidebar_label: Why Remx
slug: /introduction/why-remx
---

When writing a react / react-native project with or without TDD, we have multiple well known and battle-tested choices when it comes to state management:

* local component state
  * Pros: Easy to implement, zero boilerplate, works out of the box
  * Cons: In our opinion not very good in terms of [scale](https://en.wikipedia.org/wiki/Scalability), component becomes a [God Object](https://en.wikipedia.org/wiki/God_object) and it's really hard to test.
* redux
  * Pros: is a design pattern, scales very well, individual parts can be tested.
  * Cons: lots of boilerplate, hard to test-drive (TDD), tests tend to be tightly coupled to the redux library, [state has low cohesion](https://en.wikipedia.org/wiki/Cohesion_(computer_science)).
* mobx
  * Pros: Easy to implement, almost no boilerplate, performant, high cohesion
  * Cons: Can be used in lots of different ways, but in our opinion it has a rather complex API due to the number of features it has.

When we look at all these battle-proven solutions, especially when we're trying to build a large-scale project which lots of different people from different teams can work on, we see a need for some combination of the above features.

Let's try to break down our actual requirements and see if we can build a system to answer those.

### What do we really need from a state management library?

For starters, starting to write our business logic by doing TDD does not require any state management at all. In fact, I would argue that it can only hinder. Try this for example: start by writing test-first all features of a JS(node) application with unit tests *without* any mention of redux. It is really difficult: if all we want to do is, for example, write a unit of logic that does some login flow, with loading state and authentication and error flows, we see that we have little use of any of these libraries.

We can just test-drive some `LoginFlow.js` with regular functions/objects, call those functions from `LoginFlow.test.js` and assert on some exported state. That's it. No frameworks needed.

redux itself is really just an implementation of [flux](https://facebook.github.io/flux/). Which itself is a close relative of MVC.
We can take this design pattern and use it to build a scalable architecture, we just don't need redux itself here yet as it doesn't provide anything new and just introduces coupling and boilerplate.

So one thing we do want to enforce is some data-flow architecture. Still, no frameworks required.

Well, then where does state management come into play?

When we want to connect this `LoginFlow` into a react view. We want this view to listen to changes and re-render itself according to some presentation logic (which will be test-driven as well).

For our example, we can think about some `LogicComponent.jsx` that displays the login username and password, any sucess/failure message, and maybe a loading indicator.

All we need to do is somehow connect those 2 together. 

We can't really use redux here because it will require us to rewrite everything, and will make our business logic and tests tightly coupled to redux itself.

We can however use mobx. If we figure out a way to wrap all of our business logic with mobx's `observables`, `actions`, and our component as `observer`, we will achieve our requiremnents.

But doing that is not as simple as wrapping everything with mobx. One major thing mobx does is impact all objects that it touches, in order to observe on their state. We want to avoid that, where possible, and [es6 proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) allows us to do just that.

Furthermore, we don't need the large amount of features mobx supports. We need a small subset of the api, and we need to be very explicit about what goes where, to enforce our chosen redux-like data-flow architecture.

These decisions are what gave birth to remx. A mixed child of mobx implementation of observable state (backed by es6 proxies) with flux/redux design pattern enforcement.

### But what about dispatch? actions? middlewere?

In general, redux's middlewere is something we want to avoid. Previous experience taught us that adding just 1 middlewere to a redux store can cause serious performance hit, so we recommend not to do that and just call a function explicitly. Otherwise, if we really want, we can create our own global function that wraps any other function with some logic, for example a logging function. This can be done easily without any framework.

Actions is where we put our imperative business logic, and so we call them by simply invoking them (with arguments if needed).
Actions can be asynchronous, and shouldn't return anything (to enforce uni-directional data flow). We don't need any dispatching function because our stores are just plain old JS objects (that we test separately). So although not a part of the api (there's really nothing special about `dispatch` anyway), we encourage the separation of actions and stores for low coupling, and to put action files next to the same use-case store files, for high cohesion.

Take a look at the example project to see how remx is intended to be used.

### To conclude

* remx takes the redux (flux) architecture and enforces it through a short, simple, clean and strict API:
  * `state`
  * `setters`
  * `getters`
  * `connect`
* almost zero boilerpate
* zero impact on tests
  * can be added/removed as a plugin
  * does not impact any design decisions
* implemented with mobx, thus benefits from all the performance of
  * memoization
  * avoids unnecessary re-renders
* uses es6 Proxies (where possible)
  * avoids mobx's Observable wrappers which can cause weird bugs and behaviours
