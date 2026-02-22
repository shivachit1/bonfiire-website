import { servicesData } from "./servicesData";
import "./index.css";

const ServiceCards = () => {
  return (
    <div className="cards-container">
      {servicesData.map((service, index) => (
        <div key={index} className="service-card">
          <div className="card-icon-wrapper">{service.icon}</div>
          <h3 className="card-title">{service.title}</h3>
          <p className="card-description">{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceCards;
