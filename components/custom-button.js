const React = require('react');

class CustomButton extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { text, handleSelect, className, isSelected } = this.props;
    console.log("rendering " + text);

    const buttonColor = '#539987';

    return (
      <div className="mediaPickerSettingButton" onClick={() => handleSelect(this)} style={{
        backgroundColor: isSelected && buttonColor,
        border: `2px solid ${buttonColor}`,
        borderRadius: '5px',
        color: isSelected ? '#333333' : 'white',
        fontFamily: 'Silkscreen',
        fontSize: '16px',
        padding: '5px 10px 5px 10px',
      }}>
        <span>{text}</span>
      </div>
    );
  }
}

export default CustomButton;