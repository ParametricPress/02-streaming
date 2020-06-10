const React = require('react');

import CustomButton from './custom-button';

class MediaPickerSettings extends React.Component {
  handleSelect(selectedButton) {
    const newButtons = [];
    this.state.buttons.forEach(button => {
      const buttonProps = button.props;
      const key =  button.key;
      if (button.key === selectedButton.props.text) {
        newButtons.push(<CustomButton key={key} {...buttonProps} isSelected />);
      } else {
        newButtons.push(<CustomButton key={key} {...buttonProps} isSelected={false} />);
      }
    });
    console.log(newButtons);
    this.setState({ buttons: newButtons });
  }

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);

    // TODO get buttons data from the given video data
    const buttons = [
      <CustomButton
        text='high'
        handleSelect={this.handleSelect}
        key="high"
        isSelected
      />,
      <CustomButton
        text='medium'
        handleSelect={this.handleSelect}
        key="medium"
      />,
      <CustomButton
        text='low'
        handleSelect={this.handleSelect}
        key="low"
      />,
    ];

    const selectedButton = buttons[0];

    this.state = {
      buttons: buttons,
      selectedButton: selectedButton,
    };

  }

  render() {
    return (
      <div>
        {this.state.buttons}
      </div>
    );
  }
}

export default MediaPickerSettings;