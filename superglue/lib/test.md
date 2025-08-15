Lets develop update our types


We have a Fragment type which allows us to use

const content = useContent<{
  user: Fragment<{
    firstName: "James"
  }>

}>

Right now we have 