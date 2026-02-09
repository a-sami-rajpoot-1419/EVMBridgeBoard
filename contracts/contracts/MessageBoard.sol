// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MessageBoard
 * @dev A simple on-chain message board demonstrating dual-wallet interoperability
 * @notice This contract allows users to write messages that are visible across both MetaMask and Keplr wallets
 */
contract MessageBoard {
    // State variables
    uint256 public messageCount;
    string public lastMessage;
    address public lastSender;
    
    // Message history
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    mapping(uint256 => Message) public messages;
    
    // Events
    event NewMessage(
        address indexed sender,
        uint256 indexed count,
        string message,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    /**
     * @dev Write a new message to the board
     * @param _message The message content to store
     */
    function writeMessage(string calldata _message) external {
        require(bytes(_message).length > 0, "Message cannot be empty");
        require(bytes(_message).length <= 256, "Message too long (max 256 chars)");
        
        messageCount++;
        lastMessage = _message;
        lastSender = msg.sender;
        
        messages[messageCount] = Message({
            sender: msg.sender,
            content: _message,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        emit NewMessage(
            msg.sender,
            messageCount,
            _message,
            block.timestamp,
            block.number
        );
    }
    
    /**
     * @dev Get a specific message by ID
     * @param _messageId The ID of the message to retrieve
     * @return sender The address that sent the message
     * @return content The message content
     * @return timestamp When the message was sent
     * @return blockNumber The block number when message was sent
     */
    function getMessage(uint256 _messageId) external view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        uint256 blockNumber
    ) {
        require(_messageId > 0 && _messageId <= messageCount, "Invalid message ID");
        Message memory message = messages[_messageId];
        return (message.sender, message.content, message.timestamp, message.blockNumber);
    }
    
    /**
     * @dev Get the latest message details
     * @return count Total number of messages
     * @return message The latest message content
     * @return sender The address that sent the last message
     */
    function getLatestMessage() external view returns (
        uint256 count,
        string memory message,
        address sender
    ) {
        return (messageCount, lastMessage, lastSender);
    }
    
    /**
     * @dev Get contract statistics
     * @return totalMessages Total number of messages
     * @return latestSender Address of the latest sender
     */
    function getStats() external view returns (
        uint256 totalMessages,
        address latestSender
    ) {
        return (messageCount, lastSender);
    }
}
