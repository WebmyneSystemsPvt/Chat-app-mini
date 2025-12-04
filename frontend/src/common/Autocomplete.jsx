import { useState, useEffect, useRef } from "react";

function Autocomplete({
  options,
  onInputChange,
  onSelect,
  renderItem,
  value,
  placeholder,
  disableDropdown = false,
}) {
  const wrapperRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (!disableDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [disableDropdown]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (!disableDropdown) {
      setIsOpen(true);
    }
    onInputChange(newValue);
  };

  const handleSelect = (option) => {
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className="autocomplete-container" ref={wrapperRef}>
      <input
        type="text"
        className="autocomplete-input"
        onChange={handleChange}
        value={value}
        placeholder={placeholder}
        onClick={() => !disableDropdown && setIsOpen(true)}
      />
      {!disableDropdown && isOpen && (
        <ul className="autocomplete-dropdown">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={index}
                className="autocomplete-item"
                onClick={() => handleSelect(option)}
              >
                {renderItem(option)}
              </li>
            ))
          ) : (
            <li className="autocomplete-no-options">No options</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
