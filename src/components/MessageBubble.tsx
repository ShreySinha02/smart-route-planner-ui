import { Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import type { Message } from '../store/useAppStore'

const { Text } = Typography

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.type === 'user'
  const isStatus = message.type === 'status'

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-violet-600 text-white rounded-br-sm'
          : isStatus
          ? 'bg-transparent border border-dashed border-gray-600 rounded-bl-sm'
          : 'bg-gray-800 text-gray-100 rounded-bl-sm'
        }
      `}>
        {isStatus && (
          <LoadingOutlined className="mr-2 text-gray-400" spin />
        )}
        <Text style={{
          color: isUser ? 'white' : isStatus ? '#8892a4' : '#f3f4f6',
          fontStyle: isStatus ? 'italic' : 'normal',
          fontSize: '14px'
        }}>
          {message.text}
        </Text>
      </div>
    </div>
  )
}