import React from "react";
import "./index.css"; // Optional CSS for styling

const servicesData = [
  {
    title: "Bookkeeping",
    description:
      "Comprehensive bookkeeping services to keep your financial records organized and accurate.",
  },
  {
    title: "Tax Preparation",
    description:
      "Expert tax preparation services to maximize deductions and ensure compliance with tax laws.",
  },
  {
    title: "Financial Consulting",
    description:
      "Tailored financial consulting to help your business grow and achieve its financial goals.",
  },
  {
    title: "Payroll Services",
    description:
      "Efficient payroll processing to save you time and ensure accuracy.",
  },
  {
    title: "Audit Services",
    description:
      "Thorough audit services to provide assurance and enhance financial transparency.",
  },
];

const MyServices = () => {
  return (
    <div id="services" className="services">
      <h2>Our Services</h2>
      <p>
        We provide a full range of accounting services tailored to meet your
        needs.
      </p>
      <div className="services-list">
        {servicesData.map((service, index) => (
          <div className="service-card" key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyServices;
