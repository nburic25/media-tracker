import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MediaList from "./MediaList";
import MediaDetails from "./MediaDetails";

function App() {
return ( <Router> <Routes>
<Route path="/" element={<MediaList />} />
<Route path="/media/:id" element={<MediaDetails />} /> </Routes> </Router>
);
}

export default App;
