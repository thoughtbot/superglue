class Post < ActiveRecord::Base
  has_many :notes
end

class Note < ActiveRecord::Base
  belongs_to :post
end
