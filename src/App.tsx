import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import Homepage from './Components/Homepage';
import Forum from './Components/Forum';
import DataandHealth from './Components/DataandHealth'; 


const App = () => {
  return (
    <Router>
     <div>
        <Route exact path = "/" component = {Homepage} />
        <Route path = "/forum" component = {Forum} />
        <Route path = "/data" component = {DataandHealth} /> 
     </div>
    </Router>
  );
};

export default App; 
