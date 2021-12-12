ActiveRecord::Schema.define do
  self.verbose = false

  create_table :posts, :force => true do |t|
    t.string :title
  end

  create_table :comments, :force => true do |t|
    t.integer :post_id
    t.string :title
  end
end
