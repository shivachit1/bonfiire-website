import { servicesData } from "./servicesData"; // Adjust the path as needed
import "./index.css"; // Import the CSS file

const ServiceCards = () => {
  return (
    <div className="cards-container">
      {servicesData.map((service, index) => (
        <div key={index} className="service-card">
          <div className="card-icon-wrapper">
            {/* The icon from your data */}
            {service.icon}
          </div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceCards;
