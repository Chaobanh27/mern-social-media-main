export const meData = {
  id: '123',
  username: 'bao',
  email: 'bao@example.com',
  full_name: 'Nguyen Chanh Bao',
  avatar: 'https://example.com/avatar.png',
  bio: 'Hello! '.repeat(50)
}

export const allUsersData = Array.from({ length: 500 }, (_, i) => ({
  id: i.toString(),
  username: `user${i}`,
  email: `user${i}@example.com`,
  full_name: `User ${i}`,
  avatar: `https://example.com/avatar${i}.png`,
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)
}))